# NIAT Awards

Teacher nomination and voting app for NIAT Educator Awards 2026.

```
niatawards/
  README.md
  frontend/   Vite + React + TypeScript UI
  backend/    Express + TypeScript + MongoDB API
```

## Backend

```bash
cd backend
npm install
npm run dev
```

API: http://localhost:5000

Copy [backend/.env.example](backend/.env.example) to `backend/.env` and set:

- `MONGODB_URI` — MongoDB Atlas connection string
- `PORT` — defaults to `5000`
- MSG91 OTP env vars (`MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `OTP_SECRET`) — see [backend/.env.example](backend/.env.example). The frontend never talks to MSG91.
- `ADMIN_SECRET` — sent as `x-admin-secret` from the admin dashboard

On startup the server logs whether MongoDB connected or failed.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:8080

Set in `frontend/.env`:

- `VITE_API_URL` — backend origin, e.g. `http://localhost:5000`
- `VITE_ADMIN_SECRET` — must match backend `ADMIN_SECRET`
- `VITE_ADMIN_USER` / `VITE_ADMIN_PASS` — optional admin login overrides
