HostelConnect Monorepo (JavaScript)
===================================

This repo scaffolds a JS-only implementation of HostelConnect per your feature plan: Express API, BullMQ worker, and a simple static web frontend. Database is PostgreSQL via Prisma. Storage is MinIO (S3-compatible). Redis powers queues.

Prerequisites
- Docker Desktop
- Node.js 18+ and npm

Quick start (Windows PowerShell)
1) Copy env example
```pwsh
Copy-Item .env.example .env
```
2) Start infra (Postgres, Redis, MinIO)
```pwsh
docker compose up -d
```
3) Install deps
```pwsh
npm install --workspaces
```
4) Initialize DB (Prisma)
```pwsh
Set-Location backend/api
npx prisma migrate dev --name init
npx prisma generate
Set-Location ../..
```
5) Run all apps (API, Web, Worker, Portal)
```pwsh
npm run dev
```

Run frontend and backend separately
- Backend only (API + Worker):
```pwsh
cd backend
npm install --workspaces
npm run dev
```
- Frontend only (Static Web + React Portal):
```pwsh
cd frontend
npm install --workspaces
npm run dev
```

Services
- API: http://localhost:4000/health
- Web: http://localhost:3000
- Redis: 6379
- Postgres: 5432
- MinIO: http://localhost:9000 (console: http://localhost:9001)

Seed admin user
Use Prisma Studio to create a user record with role "admin" and a bcrypt password.
```pwsh
Set-Location backend/api
npx prisma studio
```
Table: `User`
- email: admin@example.com
- password_hash: generate with bcrypt (10 rounds)

Example bcrypt hash (password: admin123):
`$2a$10$9r6LhYBZ0xCqH8O5N7K0Le9c8K0q0o6G6cX6l3IhZ2T9uH9o8pR9W`

Then login:
POST http://localhost:4000/api/auth/login with body `{ "email": "admin@example.com", "password": "admin123" }`

Notes
- This is a foundation: endpoints are stubbed; integrate OTP, payments, and PDF generation in workers next.
- Frontend is static HTML/CSS/JS to match “no JSX/TS” request. We can expand with modular pages per role.

# Hostel_Management
To develop advanced hostel management

Attendance QR + Bulk (new)
- RC/Admin/Warden: Get rotating 6‑digit code at `/api/attendance/qr-token` (Portal RC → Attendance shows it). Students submit this code to log presence.
- Student: In Portal → Student → Attendance, enter the 6‑digit code; or click Scan (self) for a quick log.
- Bulk upload: RC → Attendance has a CSV box. Format lines as `student_id,timestamp[,method,location]` (ISO timestamps). Posts to `/api/attendance/bulk-upload` and reports inserted/errors.
- Env: `ATTENDANCE_QR_SECRET` (default dev secret), `ATTENDANCE_QR_PERIOD` (default 60 seconds).
