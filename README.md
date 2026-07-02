# Team Task Manager

Production-style collaborative task management (Trello/Asana-lite) built for company assignments and technical interviews.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Deploy | Railway (2 services + PostgreSQL) |

## Architecture

```
┌─────────────────┐     HTTPS/JWT      ┌─────────────────┐
│  Next.js (web)  │ ◄────────────────► │ Express (api)   │
│  React Query    │   REST /api/*      │ Modular routes  │
└─────────────────┘                    └────────┬────────┘
                                                  │
                                         ┌────────▼────────┐
                                         │   PostgreSQL    │
                                         │   (Prisma ORM)  │
                                         └─────────────────┘
```

**Design principles**

- **Monorepo-style folders**: `frontend/` + `backend/` (separate Railway services)
- **Feature modules** on API: `auth`, `projects`, `tasks`, `analytics`
- **RBAC**: Global user role + per-project `ProjectMember.role`
- **Thin controllers**, business logic in services, Zod validation

## Folder structure

```
Team Task Manager/
├── README.md
├── .env.example
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/          # env, prisma client
│       ├── middleware/      # auth guards, error handler
│       ├── modules/
│       │   ├── auth/
│       │   ├── projects/
│       │   ├── tasks/
│       │   └── analytics/
│       ├── validators/      # Zod schemas
│       ├── utils/           # AppError, activity logging, access checks
│       ├── app.ts
│       └── index.ts
└── frontend/
    ├── src/app/
    │   ├── (auth)/login/page.tsx
    │   ├── (auth)/signup/page.tsx
    │   ├── (app)/dashboard/page.tsx
    │   ├── (app)/projects/page.tsx
    │   ├── (app)/projects/[projectId]/page.tsx
    │   ├── layout.tsx
    │   └── page.tsx
    ├── src/components/
    │   ├── auth-guard.tsx
    │   ├── layout/app-shell.tsx
    │   ├── common/EmptyState.tsx
    │   ├── common/Loading.tsx
    │   └── ui/*               # small Tailwind-based UI primitives
    └── src/lib/
        ├── api.ts
        ├── auth.tsx
        ├── queries.ts
        ├── types.ts
        └── utils.ts
```

## Database schema (summary)

- **User** — account, global `Role` (ADMIN | MEMBER)
- **Project** — owned by one user; has many tasks and members
- **ProjectMember** — many-to-many User ↔ Project with per-project role
- **Task** — title, description, dueDate, priority, status, assignee
- **Activity** — audit log for dashboard “recent activity”

## API plan

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Auth |
| GET | `/api/projects` | Auth |
| POST | `/api/projects` | Admin |
| GET | `/api/projects/:id` | Member (assigned tasks only) |
| PATCH | `/api/projects/:id` | Project admin |
| DELETE | `/api/projects/:id` | Owner |
| POST | `/api/projects/:id/members` | Project admin |
| DELETE | `/api/projects/:id/members/:userId` | Project admin |
| GET | `/api/projects/:id/tasks` | Member (assigned tasks only) |
| POST | `/api/projects/:id/tasks` | Project admin |
| PATCH | `/api/projects/:id/tasks/:taskId` | Project admin |
| PATCH | `/api/projects/:id/tasks/:taskId/status` | Assignee or admin |
| DELETE | `/api/projects/:id/tasks/:taskId` | Project admin |
| GET | `/api/analytics/dashboard` | Auth (member sees assigned-task metrics) |

## Local development

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Railway)

### Backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET (min 16 chars)

npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

API: `http://localhost:4000`

### Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000/api

npm install
npm run dev
```

App: `http://localhost:3000`

### Seed users

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | Password123! | ADMIN |
| member@company.com | Password123! | MEMBER |

## Railway deployment

1. Create a **PostgreSQL** plugin on Railway; copy `DATABASE_URL`.
2. **API service**: root directory `backend`, start `npm run build && npm start`, set env vars from `.env.example`.
3. **Web service**: root directory `frontend`, build `npm run build`, start `npm start`, set `NEXT_PUBLIC_API_URL` to the API public URL + `/api`.
4. Set API `CLIENT_URL` to the frontend public URL.
5. Run migrations: `npx prisma migrate deploy` (Railway one-off or build step).

## API testing (curl)

```bash
# Signup (first user becomes ADMIN automatically)
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@company.com","password":"Password123!"}'

# Use token from response (token field)
export TOKEN="your-jwt"

# Seed project id (from backend/prisma/seed.ts)
PROJECT_ID="seed-project-1"

curl http://localhost:4000/api/projects -H "Authorization: Bearer $TOKEN"

curl http://localhost:4000/api/projects/$PROJECT_ID/tasks \
  -H "Authorization: Bearer $TOKEN"
```

## Interview talking points

1. **Why separate frontend/backend?** — Independent deploy, clear boundaries, matches Railway microservice layout.
2. **RBAC model** — Global role vs project-scoped `ProjectMember.role`; owner always admin.
3. **Security** — bcrypt (12 rounds), JWT in httpOnly-style storage on client (localStorage with guard routes), Helmet, CORS allowlist, Zod input validation.
4. **Scalability** — Module-per-domain, Prisma migrations, activity table for analytics without heavy joins on tasks.
5. **Member constraint** — Status-only updates enforced in `tasks.service.updateTaskStatus`.

## Implementation roadmap

- [x] Phase 1: Architecture, Prisma schema, backend scaffold
- [x] Phase 2: Auth + projects + tasks + analytics APIs
- [x] Phase 3: Next.js UI (auth, dashboard, projects, project dashboard/tasks board)
- [ ] Phase 4: Polish (animations, member/task advanced editing polish)
- [ ] Phase 5: Railway deploy + README finalize
