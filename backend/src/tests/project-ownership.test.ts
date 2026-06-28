import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../app.js';
import { prisma } from '../lib/prisma.js';

// Two DISTINCT users. This file's sole purpose is to prove ownership isolation:
// User B must never see or mutate User A's projects.
const USER_A = { email: 'usera@test.com', password: 'password123', name: 'User A' };
const USER_B = { email: 'userb@test.com', password: 'password123', name: 'User B' };
const TEST_EMAILS = [USER_A.email, USER_B.email];

let server: FastifyInstance;

// Scoped cleanup — only the two test users and their projects, NEVER a blanket
// deleteMany, since this runs against a shared database. Projects first (the
// owner FK), then the users. Idempotent, so the suite re-runs cleanly.
const cleanup = async () => {
  await prisma.project.deleteMany({ where: { owner: { email: { in: TEST_EMAILS } } } });
  await prisma.user.deleteMany({ where: { email: { in: TEST_EMAILS } } });
};

const register = async (user: typeof USER_A) => {
  const res = await server.inject({ method: 'POST', url: '/auth/register', payload: user });
  expect(res.statusCode).toBe(201);
  const body = res.json();
  return { token: body.data.token as string, id: body.data.user.id as string };
};

const authHeader = (token: string) => ({ authorization: `Bearer ${token}` });

beforeAll(async () => {
  server = buildServer();
  await server.ready();
  await prisma.$connect();
  await cleanup(); // clear leftovers from any prior crashed run before we start
});

afterEach(async () => {
  await cleanup();
});

afterAll(async () => {
  await server.close();
  await prisma.$disconnect();
});

describe('Project ownership isolation', () => {
  it("keeps User A's project invisible and immutable to User B across list/get/patch/delete", async () => {
    // 1 & 2: register two distinct users, capture both tokens
    const userA = await register(USER_A);
    const userB = await register(USER_B);

    // 3: User A creates a project
    const createRes = await server.inject({
      method: 'POST',
      url: '/projects',
      headers: authHeader(userA.token),
      payload: { name: 'User A project' },
    });
    expect(createRes.statusCode).toBe(201);
    const projectId = createRes.json().data.project.id as string;

    // 4: User B lists projects — must be EMPTY (the key leak assertion)
    const listRes = await server.inject({
      method: 'GET',
      url: '/projects',
      headers: authHeader(userB.token),
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json().data.projects).toHaveLength(0);

    // 5: User B GETs A's project by id → 404 PROJECT_NOT_FOUND (not 403)
    const getRes = await server.inject({
      method: 'GET',
      url: `/projects/${projectId}`,
      headers: authHeader(userB.token),
    });
    expect(getRes.statusCode).toBe(404);
    expect(getRes.json().error.code).toBe('PROJECT_NOT_FOUND');

    // 6: User B PATCHes A's project → 404 PROJECT_NOT_FOUND
    const patchRes = await server.inject({
      method: 'PATCH',
      url: `/projects/${projectId}`,
      headers: authHeader(userB.token),
      payload: { name: 'hacked' },
    });
    expect(patchRes.statusCode).toBe(404);
    expect(patchRes.json().error.code).toBe('PROJECT_NOT_FOUND');

    // 7: User B DELETEs A's project → 404 PROJECT_NOT_FOUND
    const deleteRes = await server.inject({
      method: 'DELETE',
      url: `/projects/${projectId}`,
      headers: authHeader(userB.token),
    });
    expect(deleteRes.statusCode).toBe(404);
    expect(deleteRes.json().error.code).toBe('PROJECT_NOT_FOUND');

    // 8: Sanity — User A still owns an intact project (B's DELETE was a no-op)
    const ownerGetRes = await server.inject({
      method: 'GET',
      url: `/projects/${projectId}`,
      headers: authHeader(userA.token),
    });
    expect(ownerGetRes.statusCode).toBe(200);
    expect(ownerGetRes.json().data.project.id).toBe(projectId);
  });
});
