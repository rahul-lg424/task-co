import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";

// Mock Prisma so tests are hermetic (no real database). bcrypt and JWT run for real.
const { findUnique, create } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user: { findUnique, create },
  },
}));

const { buildServer } = await import("../app.js");

const PASSWORD = "password123";

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user_1",
  email: "test@gmail.com",
  name: "Test User",
  passwordHash: "placeholder-hash",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

let server: FastifyInstance;
let realHash: string;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-for-vitest";
  realHash = await bcrypt.hash(PASSWORD, 10);
  server = buildServer();
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

beforeEach(() => {
  findUnique.mockReset();
  create.mockReset();
});

describe("GET /", () => {
  it("returns the health envelope", async () => {
    const res = await server.inject({ method: "GET", url: "/" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: { status: "ok" } });
  });
});

describe("POST /auth/register", () => {
  const validBody = {
    email: "test@gmail.com",
    password: PASSWORD,
    name: "Test User",
  };

  it("creates a user and returns 201 with a token and safe user fields", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue(makeUser());

    const res = await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: validBody,
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(typeof body.data.token).toBe("string");
    expect(body.data.user).toEqual({
      id: "user_1",
      email: "test@gmail.com",
      name: "Test User",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("never returns the password hash", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue(makeUser());

    const res = await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: validBody,
    });

    expect(res.payload).not.toContain("passwordHash");
    expect(res.json().data.user).not.toHaveProperty("passwordHash");
  });

  it("bcrypt-hashes the password before persisting (never plaintext)", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue(makeUser());

    await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: validBody,
    });

    const persisted = create.mock.calls[0][0].data.passwordHash;
    expect(persisted).not.toBe(PASSWORD);
    expect(await bcrypt.compare(PASSWORD, persisted)).toBe(true);
  });

  it("returns 409 when the email already exists", async () => {
    findUnique.mockResolvedValue(makeUser({ passwordHash: realHash }));

    const res = await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: validBody,
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe("EMAIL_ALREADY_EXISTS");
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 400 when name is missing", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "test@gmail.com", password: PASSWORD },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when the email is invalid", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "not-an-email", password: PASSWORD, name: "Test User" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when the password is shorter than 8 characters", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "test@gmail.com",
        password: "1234567",
        name: "Test User",
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /auth/login", () => {
  const validBody = { email: "test@gmail.com", password: PASSWORD };

  it("returns 200 with a token for correct credentials", async () => {
    findUnique.mockResolvedValue(makeUser({ passwordHash: realHash }));

    const res = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: validBody,
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(typeof body.data.token).toBe("string");
    expect(body.data.user.email).toBe("test@gmail.com");
    expect(res.payload).not.toContain("passwordHash");
  });

  it("returns 401 for a wrong password", async () => {
    findUnique.mockResolvedValue(makeUser({ passwordHash: realHash }));

    const res = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "test@gmail.com", password: "wrong-password" },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for an unknown email (no user enumeration)", async () => {
    findUnique.mockResolvedValue(null);

    const res = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: validBody,
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toEqual({
      message: "Invalid email or password",
      code: "INVALID_CREDENTIALS",
    });
  });

  it("returns 400 when the password is missing", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "test@gmail.com" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("VALIDATION_ERROR");
  });
});
