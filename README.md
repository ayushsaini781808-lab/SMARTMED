# SmartMed — AI-Enabled Hospital Appointment & Queue Platform

A working full-stack MVP built from the SmartMed PRD: JWT auth + RBAC, AI symptom
pre-triage, slot booking with row-level locking, a real-time WebSocket OPD queue,
OCR prescription upload, an admin panel, and an English/Hindi toggle.

This is a **functional, demoable MVP** — not an audited, load-tested production
deployment. Payment, SMS/WhatsApp, and OCR use the dummy/local integrations the
PRD specifies (see "What's real vs. mocked" below).

## Opening this in Antigravity

1. Unzip the project.
2. Open the **`smartmed/`** folder as your workspace root in Antigravity (it contains
   `backend/` and `frontend/` as two sibling projects — Antigravity's agent can see
   and edit both at once from this root).
3. Point Antigravity's terminal/agent at `backend/` first to install deps and seed
   the database, then at `frontend/` — commands below.
4. Everything is plain Node.js/Express/React — no special Antigravity config needed;
   treat it like any other local repo.

## Quick start (manual)

**Backend** (Terminal 1):
```bash
cd backend
npm install
npm run seed      # creates demo admin/doctors/patient + today's slots (idempotent: re-run to reset data)
npm run dev        # http://localhost:5000 (nodemon; use `npm start` for a one-off run)
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

Open `http://localhost:5173`.

### Demo accounts (password for all: `Password123!`)
| Role    | Email                          |
|---------|---------------------------------|
| Admin   | admin@smartmed.app             |
| Doctor  | anjali.sharma@smartmed.app (Neurologist) |
| Doctor  | rohan.verma@smartmed.app (Cardiologist)  |
| Patient | patient@smartmed.app           |

Try it end-to-end: log in as the patient → describe "headache and nausea" in the
symptom checker → it suggests Neurology → book a slot → log in as
`anjali.sharma@smartmed.app` in a second browser/tab → click **Start** on the
token → watch the patient's dashboard update live via WebSocket, with no refresh.

## Architecture

```
smartmed/
├── backend/                 Node.js + Express, MVC layout
│   ├── src/
│   │   ├── config/          DB (Sequelize) + file upload config
│   │   ├── models/          User, Doctor, Slot, Appointment, Prescription, Waitlist
│   │   ├── controllers/     Business logic per module (A–F from the PRD)
│   │   ├── routes/          Express routers
│   │   ├── middleware/      JWT auth, RBAC, error handler
│   │   ├── utils/           JWT signing, symptom-checker rules, notify (mock email/SMS), seed script
│   │   └── server.js        Express + Socket.io entrypoint
│   └── data/smartmed.sqlite SQLite file (auto-created; swap to Postgres, see below)
└── frontend/                React + Vite + Tailwind
    └── src/
        ├── pages/patient/   Symptom checker, booking flow, live queue widget, prescription vault
        ├── pages/doctor/    Today's queue, start/complete, prescription OCR upload
        ├── pages/admin/     Overview, departments/leave toggle, users, notification log
        ├── context/         Auth context (JWT access+refresh handling)
        ├── i18n/            English + Hindi strings (FR-F1)
        └── hooks.js         Socket.io queue subscription hook
```

## PRD feature coverage

| Module | Status |
|---|---|
| A — Auth (JWT, RBAC, Google OAuth) | ✅ JWT + RBAC live. Google OAuth endpoint built (`/api/auth/google`); wire up Google Identity Services on the frontend with your own OAuth client ID to activate the button. |
| B — Booking Engine (AI triage, calendar, slot locking) | ✅ Full — rule-based triage (swappable for a live LLM call), visual slot picker, `SELECT FOR UPDATE`-equivalent row locking verified against double-booking. |
| C — Live OPD Queue (tokens, WebSocket, wait estimate) | ✅ Full — daily per-doctor token counter, Socket.io rooms per doctor+date, rolling average consult time. |
| D — E-Prescription (OCR, vault) | ✅ Full — Tesseract.js OCR + heuristic medicine/dosage/frequency parser, chronological patient vault. |
| E — Admin (bulk cancel, waitlist notify) | ✅ Full — "Doctor on Leave" bulk-cancels future slots/appointments and notifies patients; waitlist auto-notifies the next person when a slot frees up. |
| F — Multilingual (EN/HI) | ✅ Full UI toggle, Hindi (Devanagari) strings throughout. |

## What's real vs. mocked (matches PRD scope on purpose)

- **Payment:** no real gateway — "Pay at Hospital" is the default status, as the PRD specifies, to avoid PCI-DSS scope.
- **Email/SMS/WhatsApp:** uses nodemailer's JSON transport (no real send) and a
  logged stub for SMS/WhatsApp, viewable in Admin → Notification Log. Swap in real
  SMTP/Twilio credentials in `backend/src/utils/notify.js` for production.
- **AI symptom checker:** a fast rule-based decision tree (works offline, zero API
  cost). `backend/src/utils/symptomChecker.js` is written so you can drop in a real
  Gemini/Claude API call behind the same function signature.
- **Database:** SQLite for zero-config local running. `backend/src/config/database.js`
  switches to Postgres automatically if you set a `DATABASE_URL` env var — no model
  or query changes needed.
- **Video consultation:** intentionally out of scope per the PRD.

## Moving to production

1. Set `DATABASE_URL` to a real Postgres instance and re-run `npm run seed` (or write proper migrations instead of `sequelize.sync()`).
2. Replace `backend/src/utils/notify.js` internals with real SMTP + Twilio credentials.
3. Put real secrets in `backend/.env` (`JWT_SECRET`, `JWT_REFRESH_SECRET`) — the checked-in values are dev-only.
4. Deploy backend to Render/Railway and frontend to Vercel, per the PRD's suggested hosting, and set `VITE_API_URL` in the frontend's `.env` to the deployed backend URL.
5. Add automated tests, rate limiting, and HTTPS termination before handling real patient data.
