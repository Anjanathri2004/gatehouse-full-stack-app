# Gatehouse - role-based access console

Angular 12 (Angular Material) SPA + Node.js/TypeScript (Express) API with **pluggable storage: JSON file, MongoDB or AWS DynamoDB**, JWT auth and bcrypt password hashing.

```
gatehouse/
  backend/    Express + TypeScript API, stores (json | mongo | dynamo), seed script, Jest tests
  frontend/   Angular 12 SPA, lazy-loaded feature modules, Angular Material, Karma/Jasmine tests
  docker-compose.yml   optional local MongoDB + DynamoDB Local
```

## Run it
```bash
# terminal 1 - API on :3000 (uses the JSON file store by default, no setup)
cd backend && npm install && npm run dev

# terminal 2 - SPA on :4200 (proxies /api to :3000)
cd frontend && npm install --legacy-peer-deps && npm start
```
Use Node 14 or 16 for Angular 12 (on Node 17+ run `export NODE_OPTIONS=--openssl-legacy-provider` first).

Demo accounts: `admin` / `Admin@123` (Admin), `john` / `User@123` and `asha` / `User@123` (General User).

## Choosing the database
Copy `backend/.env.example` to `backend/.env` and set `STORE`:

| STORE | What you need |
|---|---|
| `json` (default) | nothing. Data lives in `backend/data/db.json` |
| `mongo` | `MONGO_URI` + `MONGO_DB`. Local: `docker compose up -d mongo`. Cloud: MongoDB Atlas connection string |
| `dynamo` | `AWS_REGION` + AWS credentials (AWS CLI `aws configure`, env vars or an IAM role). Tables `<prefix>-users` and `<prefix>-records` are created automatically. Local: `docker compose up -d dynamodb` and `DYNAMO_ENDPOINT=http://localhost:8000` |

`npm run seed` connects to the chosen store, creates tables/indexes and inserts demo data if empty (the server also does this on start).
All routes depend only on the `Store` interface (`backend/src/stores/store.ts`), so adding another backend means implementing that one interface.

Set a long random `JWT_SECRET` in any shared or deployed environment.

## Features
- **Login** with User ID, Password and Role. A role the account does not have is rejected.
- **Access levels:** `GET /api/records` returns public + general records to General Users and adds admin-tier records for Admins. The table shows each record's tier and how many are hidden.
- **Async processing:** every API call accepts `?delay=<ms>` (max 10000). The dashboard loads Profile and Records in parallel with separate delays; each section shows a skeleton, then renders when its own data arrives, with its load time.
- **Records table** (Material): sorting, filtering and pagination.
- **Admin user management** (`/admin`, Admin only): sortable, paginated list; add, edit, activate/deactivate, delete (with confirm dialog); per-row pending states. Click a User ID to open `/admin/users/:userId`, a detail page loaded by a **route resolver**.
- **Security:** bcrypt password hashes, JWT with 2h expiry, role checks on the server, admins cannot delete or demote themselves.
- **Global error handling:** an HTTP interceptor shows a toast when the API is unreachable or returns 5xx.

## Architecture (frontend)
- `CoreModule`: singleton services (`AuthService`, `UserService`), auth + error interceptors, imported once.
- `SharedModule` / `MaterialModule`: access badge, delay slider, confirm dialog, pipe, Material imports.
- Lazy-loaded `AuthModule`, `DashboardModule`, `AdminModule`; `AuthGuard` enforces login and role (`data.roles`).
- Presentational components (`RecordsTableComponent`, `UsersTableComponent`) receive data via `@Input` and emit events.

## API
| Method | Path | Notes |
|---|---|---|
| GET | /api/health | status + active store |
| POST | /api/auth/login | `{userId, password, role}` returns `{token, user}` |
| GET | /api/me | current user |
| GET | /api/records | filtered by role |
| GET / POST | /api/users | Admin only |
| GET / PUT / DELETE | /api/users/:userId | Admin only |

## Tests
```bash
cd backend  && npm test                 # Jest + supertest: auth, role access, delay, admin CRUD, bcrypt (12 tests)
cd frontend && npm test                 # Karma + Jasmine (needs Chrome)
cd frontend && npx ng test --watch=false --browsers=ChromeHeadlessCI   # headless / CI
```

## Deploying (optional)
- API: AWS Elastic Beanstalk / EC2 / Lambda behind API Gateway, with `STORE=dynamo` and an IAM role that can read/write the two tables.
- SPA: `cd frontend && npm run build` then host `dist/gatehouse-web` on S3 + CloudFront or Netlify. Set `apiUrl` in `src/environments/environment.prod.ts` to your API URL and `CORS_ORIGIN` on the API to your site URL.
