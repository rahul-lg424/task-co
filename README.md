# TaskCo

TaskCo is a full-stack task manager. A user registers/logs in, creates **projects**, and manages **tasks** within them. Each task has a status (Todo / In Progress / Done), a priority (Low / Medium / High), and an optional due date. Everything is **strictly owner-scoped** — you only ever see and manage your own projects and tasks. No sharing, no collaboration.

**Features:** auth (register / login / me), project CRUD, task CRUD with status + priority filtering, a dashboard of projects with task counts, and a project detail page with filtering.

> **⚠️ Accuracy notes (please confirm — see "Deviations from the brief" at the bottom):**
> - The frontend uses **Redux Toolkit**, *not* TanStack Query.
> - The backend listens on **port 5000** (set by `PORT` in `backend/.env`), not 3000.
> - There is **no `.env.example` file in the repo yet** — the block below is provided for you to create one.
> - The frontend currently has a **`package-lock.json` (npm)**, while the backend uses **pnpm**.

---

## Stack

**Backend**
- TypeScript `^5.7.3`
- Node.js `TODO — no "engines" field in package.json; verify. Node 20.6+ recommended (the dev script uses --env-file)`
- Fastify `^5.2.0` (+ `@fastify/cors ^11.2.0`, `@fastify/rate-limit ^11.1.0`)
- Prisma `^5.6.1` (CLI) / `@prisma/client 5.22.0`
- PostgreSQL `TODO — not pinned in the repo; the Docker command below uses postgres:16. Verify your server version.`
- Zod `^3.23.0`, bcrypt `^5.1.1`, jose `^5.0.1` (JWT)
- Vitest `^2.1.4`, tsx `^4.19.0`

**Frontend**
- React `^18.3.1`
- Vite `^5.4.8`
- TypeScript `^5.5.4`
- Tailwind CSS `^3.4.13`
- **Redux Toolkit `^2.2.7`** + react-redux `^9.1.2`  *(the brief said TanStack Query — the repo uses Redux Toolkit)*
- React Router `^6.26.2`
- axios `^1.7.7`

**Package manager:** pnpm for the backend (`pnpm-lock.yaml`). The frontend currently has a `package-lock.json` (npm) — see Deviations.

---

## Prerequisites

- **Node.js** `TODO — verify; 20.6+ recommended`
- **pnpm** `TODO — verify your version (e.g. via "pnpm --version")`
- A running **PostgreSQL** instance (Docker command provided below)
- **Git**

---

## Setup

1. **Clone the repo**
   ```bash
   git clone <your-repo-url> taskco
   cd taskco
   ```

2. **Install dependencies** (per app)
   ```bash
   cd backend  && pnpm install
   cd ../frontend && pnpm install   # NOTE: frontend currently has a package-lock.json (npm); see Deviations
   ```

3. **Start PostgreSQL** (Docker)
   ```bash
   docker run --name taskco-pg \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=taskco \
     -p 5432:5432 -d postgres:16
   ```

4. **Create your env files** from the examples below (there is **no `.env.example` committed yet** — create `backend/.env` and `frontend/.env` manually).

5. **Apply database migrations** (from `backend/`)
   ```bash
   pnpm prisma migrate dev
   ```

6. **(Optional) Inspect data**
   ```bash
   pnpm prisma studio
   ```

7. **Start the backend** (from `backend/`)
   ```bash
   pnpm dev      # http://localhost:5000  (PORT is set to 5000 in backend/.env)
   ```

8. **Start the frontend** (from `frontend/`)
   ```bash
   pnpm dev      # http://localhost:5173
   ```

### Environment variables

Create **`backend/.env`**:
```env
# PostgreSQL connection string (matches the Docker command above)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskco

# Long random string used to sign/verify JWTs (server refuses to start without it)
JWT_SECRET=replace-with-a-long-random-string

# Optional — port the API listens on (code defaults to 3000; this repo uses 5000)
PORT=5000

# Optional — allowed frontend origin for CORS (defaults to http://localhost:5173)
CORS_ORIGIN=http://localhost:5173
```

Create **`frontend/.env`**:
```env
# Base URL of the backend API (code defaults to http://localhost:5000)
VITE_API_URL=http://localhost:5000
```

**Env vars actually referenced in the code:**
- `DATABASE_URL` — required, used by Prisma (`backend/src/prisma/schema.prisma`).
- `JWT_SECRET` — required, used in `backend/src/lib/jwt.ts` (no fallback; startup fails if missing).
- `PORT` — *optional*, read in `backend/src/index.ts` (defaults to `3000`; this repo's `.env` sets `5000`). **Not in your list — flagging it.**
- `CORS_ORIGIN` — *optional*, read in `backend/src/app.ts` (defaults to `http://localhost:5173`). **Not in your list — flagging it.**
- `VITE_API_URL` — *optional*, read in `frontend/src/lib/api-client.ts` (defaults to `http://localhost:5000`).

---

## Running / scripts

**Backend** (`backend/package.json`)
| Command | Description |
|---|---|
| `pnpm dev` | Run the API with hot reload (`tsx watch`), on `http://localhost:5000` |
| `pnpm test` | Run the Vitest suite |
| `pnpm prisma migrate dev` | Create/apply migrations and regenerate the Prisma client |
| `pnpm prisma studio` | Open Prisma Studio |

> There is **no `build` or `start` script** in the backend package.json (dev/test only).

**Frontend** (`frontend/package.json`)
| Command | Description |
|---|---|
| `pnpm dev` | Vite dev server on `http://localhost:5173` |
| `pnpm build` | Production build |
| `pnpm preview` | Preview the production build |
| `pnpm typecheck` | `tsc --noEmit` |

---

## API reference

Base URL: `http://localhost:5000`. **Response envelope:** success → `{ "data": ... }`, failure → `{ "error": { "message", "code" } }`.

### Auth
| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| POST | `/auth/register` | – | `{ email, password, name }` | `{ data: { token, user } }` |
| POST | `/auth/login` | – | `{ email, password }` | `{ data: { token, user } }` |
| GET | `/auth/me` | Bearer | – | `{ data: { id, email, name, createdAt } }` |

### Projects (all Bearer, owner-scoped)
| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/projects` | – | `{ data: { projects } }` ¹ — each includes a task count |
| POST | `/projects` | `{ name, description, color }` | `{ data: { project } }` |
| GET | `/projects/:id` | – | `{ data: { project } }` (includes task count) |
| PATCH | `/projects/:id` | `{ partial }` | `{ data: { project } }` |
| DELETE | `/projects/:id` | – | `{ data: { deleted: true } }` |

### Tasks (all Bearer, owner-scoped)
| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/projects/:id/tasks?status=X&priority=Y` | – | `{ data: { tasks } }` ¹ |
| POST | `/projects/:id/tasks` | `{ title, description, status, priority, dueDate }` | `{ data: { task } }` |
| PATCH | `/tasks/:id` | `{ partial }` | `{ data: { task } }` |
| DELETE | `/tasks/:id` | – | `{ data: { id } }` |

¹ The brief listed these list responses as `{ data: Project[] }` / `{ data: Task[] }`. The actual implementation nests them under a key: `{ data: { projects } }` and `{ data: { tasks } }`. Documented as implemented.

---

## Project structure

**Backend — `backend/src/`**
| Dir | Holds |
|---|---|
| `routes/` | HTTP route definitions + middleware attachment |
| `controllers/` | Request handlers / response shaping (thin) |
| `services/` | Business logic, Prisma calls, bcrypt, JWT signing |
| `middleware/` | `auth-middleware` — JWT verification preHandler |
| `schemas/` | Zod validation schemas |
| `validators/` | *Empty placeholder (`.gitkeep` only) — no files yet* |
| `lib/` | Prisma client (`prisma.ts`), JWT helper (`jwt.ts`) |
| `prisma/` | `schema.prisma` + migrations |
| `types/` | Shared types / Fastify request augmentation (`fastify.d.ts`) |
| `utils/` | *Empty placeholder (`.gitkeep` only) — no files yet* |
| `tests/` | Vitest tests |

**Frontend — `frontend/src/`**
| Dir | Holds |
|---|---|
| `pages/` | Login, Register, Dashboard, Project pages |
| `components/` | Cards, forms, badges, layout, filter bar |
| `lib/` | axios `api-client.ts`, `auth-storage.ts` |
| `store/` | **Redux Toolkit** slices (auth/projects/tasks) + typed hooks |
| `routes/` | `ProtectedRoute` |
| `constants/` | Badge style maps |
| `types/` | `User`, `Project`, `Task`, `Status`, `Priority` |
| `styles/` | Tailwind directives (`index.css`) |

> Provider setup lives in `frontend/src/app.tsx` — it wraps the app in the **Redux `<Provider>`** and `<BrowserRouter>`. *(The brief mentioned a "TanStack Query setup in app.tsx"; there is none — it's Redux.)*

---

## Not implemented (out of scope)

- No OAuth / SSO / social login
- No password reset or email verification
- No websockets / real-time updates
- No file uploads / attachments
- No task sharing / collaboration / teams
- No comments / tags / subtasks
- No notifications
- No CI/CD
- No production Docker deployment config (the Docker command above is for local PostgreSQL only)

---

## Known issues / security gaps (from the security review — NOT yet fixed)

> Correction to the brief's placeholder: **rate limiting IS implemented** on `/auth/register` and `/auth/login` (10 requests/min per IP, `429 RATE_LIMITED`) — so it is **not** an open gap. The genuinely unfixed items are:

- **Unbounded string fields** — no `.max()` length on `password`/`name` (`backend/src/schemas/auth-schema.ts`), project `name`/`description` (`project-schema.ts`), and task `title`/`description` (`task-schema.ts`). Oversized inputs are only bounded by Fastify's default body limit.
- **JWT stored in `localStorage`** (`frontend/src/lib/auth-storage.ts`) — readable by any XSS; tradeoff vs httpOnly cookies.
- **7-day JWT expiry, no refresh/revocation** (`backend/src/lib/jwt.ts`) — a leaked token stays valid for a week.
- **bcrypt cost factor 10** (`backend/src/services/auth-service.ts`) — consider 12.
- **No security headers / no explicit body limit** — no `@fastify/helmet`, no custom `bodyLimit` (relies on Fastify default).

To check dependencies and git history yourself:
```bash
cd backend  && pnpm audit       # look for high/critical
cd frontend && npm audit        # frontend uses npm
git log --all -p -S '<your JWT_SECRET or DB password>'   # clean = no output
```

---

## Deviations from the brief (please confirm / fill in)

These are places where the brief and the actual repo disagree, or where I couldn't verify a value:

1. **Frontend state library:** brief said *TanStack Query*; repo uses **Redux Toolkit**. Documented as Redux. (No TanStack Query / `QueryClient` in the code.)
2. **Backend port:** brief said *3000*; `backend/.env` sets `PORT=5000` and the frontend points at 5000. Documented as **5000**.
3. **`.env.example`:** does **not** exist in the repo. I provided env blocks to create `backend/.env` and `frontend/.env`. *(TODO: create `.env.example` files if you want them committed.)*
4. **Frontend package manager:** brief said pnpm only; frontend has a **`package-lock.json` (npm)**. Backend correctly uses pnpm. *(TODO: decide on one manager for the frontend.)*
5. **Extra env vars in code (not in your list):** `PORT` and `CORS_ORIGIN` (both backend, optional).
6. **List response shapes:** brief said `{ data: Project[] }` / `{ data: Task[] }`; code returns `{ data: { projects } }` / `{ data: { tasks } }`. Documented as implemented.
7. **Rate limiting:** brief's known-gaps placeholder listed it as missing; it is **implemented**. Removed from gaps.
8. **TODOs to verify:** Node.js version (no `engines` field), pnpm version, PostgreSQL server version.
