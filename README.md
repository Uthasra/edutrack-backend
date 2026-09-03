# EduTrack — Student Management System (Backend API)

Express + MongoDB (Mongoose) + JWT + Google Gemini backend for the EduTrack
Student Management dashboard. Built in the same structure as the reference CRM
backend (`config/`, `middleware/`, `routes/`, ES modules).

## Stack
Node + Express 4 · MongoDB / Mongoose 8 · JWT (`jsonwebtoken`) ·
`bcryptjs` · `@google/genai` (Gemini) · `morgan` · `cors` · `dotenv`.

## Setup
```bash
npm install
cp .env.example .env      # then edit values
npm run seed              # optional: demo data (needs MongoDB running)
npm run dev               # http://localhost:8000
```

### Environment (.env)
| Key | Purpose |
|-----|---------|
| `PORT` | API port (default 8000) |
| `CLIENT_URL` | Allowed CORS origin (your Vite app, e.g. http://localhost:5173) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Token signing |
| `GEMINI_API_KEY` | Optional. **If empty, AI endpoints return canned fallbacks** so everything still works. |
| `GEMINI_MODEL` | e.g. `gemini-2.5-flash` |

> Security: never commit `.env`. The key that was in your uploaded env file
> should be rotated — treat it as leaked.

## Auth
JWT bearer tokens. `POST /register` and `POST /login` return `{ token, user }`.
Send `Authorization: Bearer <token>` on every other route. All data is scoped
to the logged-in user (`owner`).

## Endpoints
Base URL: `/api`

| Method | Path | Notes |
|--------|------|-------|
| GET  | `/health` | liveness |
| POST | `/auth/register` · `/auth/login` | public |
| GET/PUT | `/auth/me` · `/auth/profile` | current user |
| GET/POST | `/students` | list / create |
| GET/PUT/DELETE | `/students/:id` | single |
| PATCH | `/students/reorder` | `{ updates:[{id,status,order}] }` (Admissions board) |
| GET/POST | `/lecturers` · GET/PUT/DELETE `/lecturers/:id` | faculty |
| GET/POST | `/notes` · PUT/DELETE `/notes/:id` | notes |
| GET/POST | `/assignments` · PUT/DELETE `/assignments/:id` | tasks |
| GET | `/analytics/overview` | dashboard stats + trend + board |
| GET | `/ai/status` | is Gemini configured |
| POST | `/ai/student-summary` | `{ studentId }` |
| POST | `/ai/generate-email` | `{ studentId, purpose, tone }` |
| POST | `/ai/insights` | cohort-level insights |

Every response is `{ success, ... }`; list routes add `count`.

## Data model
- **Student**: name, regNo, gpa, email, phone, program, `status`
  (Applied/Enrolled/Active/Graduated/Withdrawn), `priority` (academic risk),
  `source` (entry route), `value` (credits), tags, order, aiSummary, aiRiskScore.
- **Lecturer**: name, title, program (department), email, phone, tags, favorite.
- **Note**: content, student ref, pinned.
- **Assignment**: title, description, dueDate, status, priority, relatedStudent, completedAt.

## Quick smoke test (curl)
```bash
# register
curl -s localhost:8000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Reg","email":"reg@ruh.ac.lk","password":"Test@1234"}'
# login → copy the token
TOKEN=$(curl -s localhost:8000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"reg@ruh.ac.lk","password":"Test@1234"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
# create a student
curl -s localhost:8000/api/students -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Kasun R","program":"BSc Computer Science","status":"Active","value":60,"gpa":3.4}'
# dashboard
curl -s localhost:8000/api/analytics/overview -H "Authorization: Bearer $TOKEN"
```

## Connecting the frontend
See **FRONTEND_INTEGRATION.md** — it contains the exact `src/lib/api.js` and
`src/lib/services.js` to drop into the EduTrack frontend to switch it from mock
mode to this live API.
