# CRM Inmobiliario

Full-stack real estate CRM with a React frontend (admin panel + public website) and a Node.js/Express backend.

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, TypeScript, TailwindCSS, React Router v6, TanStack Query v5, Zustand v5 |
| Backend   | Node.js 20+, Express 4, TypeScript, Prisma ORM |
| Database  | PostgreSQL 15+ |
| Auth      | JWT (access + refresh tokens), bcrypt |
| Storage   | Multer + Sharp (WebP resize) |
| Container | Docker + Docker Compose |

---

## Requirements

| Tool       | Minimum version | Install |
|------------|-----------------|---------|
| Node.js    | 20.x            | [nodejs.org](https://nodejs.org) |
| npm        | 10.x            | bundled with Node |
| PostgreSQL | 15.x            | [postgresql.org](https://www.postgresql.org) — or use Docker |
| Docker     | 24.x *(optional)* | [docs.docker.com](https://docs.docker.com/get-docker/) |

---

## Quick Start (Local Development)

### 1 — Clone and install dependencies

```bash
git clone https://github.com/your-org/crm-inmobiliario.git
cd crm-inmobiliario

# Install all workspace dependencies (server + client)
npm install
```

### 2 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values (see [Environment Variables](#environment-variables) below).  
At a minimum you must set:
- `DATABASE_URL` — pointing to a running PostgreSQL instance
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — random 48-char strings

### 3 — Start PostgreSQL

**Option A — Docker (recommended)**
```bash
docker compose up postgres -d
```

**Option B — Local PostgreSQL**  
Create a database manually:
```sql
CREATE USER crm_user WITH PASSWORD 'crm_password';
CREATE DATABASE crm_db OWNER crm_user;
```

### 4 — Run database migrations

```bash
npm run db:migrate
```

This generates the Prisma client and applies all migrations.

### 5 — (Optional) Seed the database

Populates 2 users, 5 properties, 3 clients, 2 deals, tasks and notes.

```bash
npm run db:seed
```

Seed credentials:
```
admin@crminmobiliario.es  →  Admin1234!   (role: ADMIN)
agente@crminmobiliario.es →  Agent1234!   (role: AGENT)
```

### 6 — Start development servers

```bash
npm run dev
```

This starts both the API server and Vite dev server concurrently:

| Service        | URL                         |
|----------------|-----------------------------|
| API server     | http://localhost:4000       |
| Client (Vite)  | http://localhost:5173       |
| Health check   | http://localhost:4000/health |
| Prisma Studio  | `npm run db:studio`         |

---

## Docker Compose (Full Stack)

Build and run everything with Docker:

```bash
# Build images and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

Services started:
- `postgres` — PostgreSQL 16 on port 5432
- `server`   — Express API on port 4000
- `client`   — Nginx serving the built React app on port 5173

---

## Environment Variables

| Variable                | Default                  | Description |
|-------------------------|--------------------------|-------------|
| `POSTGRES_USER`         | `crm_user`               | PostgreSQL username |
| `POSTGRES_PASSWORD`     | —                        | PostgreSQL password (**required**) |
| `POSTGRES_DB`           | `crm_db`                 | PostgreSQL database name |
| `DATABASE_URL`          | —                        | Full Prisma connection string (**required**) |
| `PORT`                  | `4000`                   | Express server port |
| `NODE_ENV`              | `development`            | `development` \| `production` \| `test` |
| `CLIENT_URL`            | `http://localhost:5173`  | CORS allowed origin |
| `JWT_SECRET`            | —                        | Access token secret — min 32 chars (**required**) |
| `JWT_REFRESH_SECRET`    | —                        | Refresh token secret — min 32 chars (**required**) |
| `JWT_EXPIRES_IN`        | `15m`                    | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN`| `7d`                     | Refresh token expiry |
| `UPLOAD_DIR`            | `uploads`                | Image storage directory |
| `MAX_FILE_SIZE_MB`      | `5`                      | Max upload size per file |
| `BCRYPT_ROUNDS`         | `12`                     | bcrypt work factor |
| `VITE_API_URL`          | `http://localhost:4000/api` | API base URL (browser) |
| `VITE_PUBLIC_URL`       | `http://localhost:5173`  | Canonical site URL for SEO |

---

## API Endpoints

All protected routes require `Authorization: Bearer <access_token>`.

### Authentication

| Method | Path                         | Auth     | Description |
|--------|------------------------------|----------|-------------|
| POST   | `/api/auth/login`            | ❌ Public | Login — returns tokens |
| POST   | `/api/auth/refresh`          | ❌ Public | Refresh access token |
| GET    | `/api/auth/me`               | ✅       | Get current user profile |
| POST   | `/api/auth/logout`           | ✅       | Logout (stateless) |
| PUT    | `/api/auth/change-password`  | ✅       | Change password |
| POST   | `/api/auth/register`         | 🔒 ADMIN | Create new user |

### Properties

| Method | Path                              | Auth        | Description |
|--------|-----------------------------------|-------------|-------------|
| GET    | `/api/properties`                 | ✅          | List (paginated + filters) |
| GET    | `/api/properties/slug/:slug`      | ❌ Public   | Get by slug (public website) |
| GET    | `/api/properties/:id`             | ✅          | Get by ID |
| POST   | `/api/properties`                 | ADMIN/AGENT | Create |
| PUT    | `/api/properties/:id`             | ADMIN/AGENT | Update |
| PATCH  | `/api/properties/:id/status`      | ADMIN/AGENT | Change status |
| DELETE | `/api/properties/:id`             | 🔒 ADMIN   | Delete |
| POST   | `/api/properties/:id/images`      | ADMIN/AGENT | Upload images (multipart) |
| DELETE | `/api/properties/:id/images/:imgId` | ADMIN/AGENT | Delete image |
| PATCH  | `/api/properties/:id/images/reorder` | ADMIN/AGENT | Reorder images |

### Clients

| Method | Path                | Auth        | Description |
|--------|---------------------|-------------|-------------|
| GET    | `/api/clients`      | ✅          | List with search + filters |
| GET    | `/api/clients/:id`  | ✅          | Get by ID |
| POST   | `/api/clients`      | ADMIN/AGENT | Create |
| PUT    | `/api/clients/:id`  | ADMIN/AGENT | Update |
| DELETE | `/api/clients/:id`  | 🔒 ADMIN   | Delete |

### Pipeline (Deals)

| Method | Path                     | Auth        | Description |
|--------|--------------------------|-------------|-------------|
| GET    | `/api/deals`             | ✅          | List with filters |
| GET    | `/api/deals/stats`       | ✅          | Count + amount by status |
| GET    | `/api/deals/:id`         | ✅          | Get by ID |
| POST   | `/api/deals`             | ADMIN/AGENT | Create |
| PUT    | `/api/deals/:id`         | ADMIN/AGENT | Update |
| PATCH  | `/api/deals/:id/status`  | ADMIN/AGENT | Move to pipeline stage |
| DELETE | `/api/deals/:id`         | 🔒 ADMIN   | Delete |

### Tasks

| Method | Path                       | Auth        | Description |
|--------|----------------------------|-------------|-------------|
| GET    | `/api/tasks`               | ✅          | List with filters |
| GET    | `/api/tasks/:id`           | ✅          | Get by ID |
| POST   | `/api/tasks`               | ADMIN/AGENT | Create |
| PUT    | `/api/tasks/:id`           | ADMIN/AGENT | Update |
| PATCH  | `/api/tasks/:id/toggle`    | ADMIN/AGENT | Toggle completed |
| DELETE | `/api/tasks/:id`           | ADMIN/AGENT | Delete |

### Notes (polymorphic)

| Method | Path            | Auth        | Description |
|--------|-----------------|-------------|-------------|
| GET    | `/api/notes?entity_type=X&entity_id=Y` | ✅ | List for entity |
| POST   | `/api/notes`    | ADMIN/AGENT | Create note |
| PUT    | `/api/notes/:id`| ADMIN/AGENT | Update note |
| DELETE | `/api/notes/:id`| ADMIN/AGENT | Delete note |

### Web Contacts (public form)

| Method | Path                           | Auth        | Description |
|--------|--------------------------------|-------------|-------------|
| POST   | `/api/web-contacts`            | ❌ Public   | Submit contact form |
| GET    | `/api/web-contacts`            | ADMIN/AGENT | List inbox |
| GET    | `/api/web-contacts/:id`        | ADMIN/AGENT | Get by ID |
| PATCH  | `/api/web-contacts/:id/read`   | ADMIN/AGENT | Mark as read |

### Dashboard

| Method | Path                   | Auth | Description |
|--------|------------------------|------|-------------|
| GET    | `/api/dashboard/stats` | ✅   | Aggregated KPIs |

### Pagination query parameters

All list endpoints accept:

| Param   | Default | Description |
|---------|---------|-------------|
| `page`  | `1`     | Page number |
| `limit` | `20`    | Items per page (max 100) |

Responses include a `meta` object:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1, "limit": 20, "total": 87,
    "total_pages": 5, "has_next": true, "has_prev": false
  }
}
```

---

## Available Scripts

### Root (runs on both workspaces)

```bash
npm run dev              # Start server + client concurrently
npm run build            # Build both for production
npm run dev:server       # Start API server only
npm run dev:client       # Start Vite dev server only
npm run db:migrate       # Apply pending Prisma migrations
npm run db:generate      # Re-generate Prisma client
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio in browser
npm run docker:up        # Start Docker Compose services
npm run docker:down      # Stop Docker Compose services
npm run docker:logs      # Stream Docker logs
```

### Server only (`cd server`)

```bash
npm run dev              # tsx watch (hot reload)
npm run build            # tsc compile to dist/
npm run start            # Start compiled server
npm run db:reset         # Reset + re-migrate database (dev only)
npm run db:clean-images  # Dry-run orphan image scan
npm run db:clean-images:delete  # Actually delete orphan files
```

### Client only (`cd client`)

```bash
npm run dev              # Vite dev server
npm run build            # Type-check + Vite build
npm run preview          # Preview production build
```

---

## Project Structure

```
crm-inmobiliario/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma       ← Database schema
│   │   └── seed.ts             ← Sample data
│   └── src/
│       ├── config/             ← env, database, storage
│       ├── jobs/               ← cleanOrphanImages.ts
│       ├── lib/                ← pagination helpers
│       ├── middleware/         ← auth, authorize, validate, upload, errorHandler
│       ├── modules/
│       │   ├── auth/
│       │   ├── clients/
│       │   ├── dashboard/
│       │   ├── deals/
│       │   ├── notes/
│       │   ├── properties/
│       │   ├── tasks/
│       │   └── web-contacts/
│       └── utils/
│           └── slug.ts
└── client/
    └── src/
        ├── components/
        │   ├── guards/         ← ProtectedRoute, RoleGuard
        │   ├── layout/         ← AdminLayout, PublicLayout, Sidebar
        │   └── ui/             ← Button, Input, Modal, Badge, Pagination…
        ├── hooks/              ← useAuth, useDebounce, useQueries
        ├── lib/                ← api (axios), queryClient, utils
        ├── pages/
        │   ├── admin/          ← Dashboard, Properties, Clients, Deals, Tasks…
        │   ├── auth/           ← LoginPage
        │   └── public/         ← HomePage, Listings, Detail, Contact
        ├── router.tsx
        └── stores/             ← authStore, uiStore (Zustand)
```

---

## User Roles

| Role    | Permissions |
|---------|-------------|
| `ADMIN` | Full access: CRUD on all entities, user management, delete operations |
| `AGENT` | CRUD on own properties, clients, deals and tasks. Read-only on others |
| `VIEWER`| Read-only access to all resources |

---

## License

MIT — see [LICENSE](LICENSE) for details.
