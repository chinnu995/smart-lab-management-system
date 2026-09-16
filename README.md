# Smart Lab Management System

A full-stack Smart Lab Management System for colleges with real-time analytics, camera/QR attendance, AI chatbot, announcements, parent notifications, and role-based access control.

**Stack:** React + Vite + Tailwind + Recharts + Socket.io-client (frontend) · Node.js + Express + JWT + Bcrypt + Socket.io + Nodemailer + Twilio (backend) · MySQL (database)

**Team:** Chinmay Hegde (Full Stack) · Shreesha Amathe (Security) · Kalashree P N (Graphics) · Kirankumar R (UI/UX)

---

## Folder structure

```
smart-lab/
├── backend/        # Express + Socket.io API
├── frontend/       # React + Vite SPA
└── database/
    └── schema.sql  # Full MySQL schema + triggers + procedures + seed
```

## Prerequisites

- **Node.js 18+** and npm
- **MySQL 8+** running locally (or remote)

---

## 1) Database setup

```bash
mysql -u root -p < database/schema.sql
```

This creates the `smart_lab_db` database with all tables, triggers, stored procedures, views, and seed data (1 HOD, 1 Faculty, 1 Student, 3 Labs, equipment, timetable, sample attendance).

---

## 2) Backend setup

```bash
cd backend
cp .env.example .env       # then edit DB_PASSWORD, JWT_SECRET, SMTP, Twilio
npm install
node scripts/seed.js       # IMPORTANT: regenerates demo password hashes (do this once after schema import)
npm run dev                # runs on http://localhost:5000
```

> Why `seed.js` is needed: the placeholder bcrypt hash in `schema.sql` is not a real hash. The script rewrites it with a proper bcrypt hash of `password123` for all three demo accounts.

---

## 3) Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Demo credentials

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| HOD     | hod@lab.edu       | password123 |
| Faculty | faculty@lab.edu   | password123 |
| Student | student@lab.edu   | password123 |

---

## Feature map

### Student
- Dashboard with attendance %, charts, announcements
- Mark attendance (QR scan + camera preview)
- Book labs, raise complaints, AI chatbot

### Faculty
- Bulk attendance with present/absent/late
- Generate session QR codes (15-min expiry)
- Approve/reject bookings
- Resolve complaints, post announcements

### HOD (Super Admin)
- Manage students, faculty, labs, equipment
- Full analytics: attendance trends, lab utilization, equipment status, complaint resolution, **heatmap**, faculty performance
- Audit logs (every sensitive action is logged via DB triggers + app middleware)

### Real-time (Socket.io)
- Booking decisions push to requester
- New announcements broadcast by role
- Complaint events notify faculty/HOD
- Toast notifications with badge count

### Parent notifications
- When a student's attendance drops below 75%, email + SMS are sent automatically (see `attendanceController.mark`)

---

## Integration stubs (production hooks)

| Feature             | Where to plug in                                                | Notes |
|---------------------|------------------------------------------------------------------|-------|
| Face recognition    | `POST /api/attendance/camera` (controller stub already accepts student_id, confidence, image_path) | Run face-api.js in the browser **or** a Python OpenCV worker that calls this endpoint |
| Real AI chatbot     | `backend/src/controllers/chatbotController.js`                   | Replace the intent matcher with OpenAI/Anthropic calls |
| SMS                 | `backend/src/utils/sms.js`                                       | Twilio creds in `.env` — no-ops gracefully if missing |
| Email               | `backend/src/utils/mailer.js`                                    | Nodemailer SMTP creds in `.env` |

---

## API surface (selected)

```
POST   /api/auth/login
POST   /api/auth/register            (HOD only)
GET    /api/auth/me

GET    /api/students                 (HOD/Faculty)
POST   /api/students                 (HOD)
GET    /api/me/attendance            (Student)

POST   /api/attendance/mark          (Faculty)
POST   /api/attendance/bulk          (Faculty)
POST   /api/attendance/qr/generate   (Faculty)
POST   /api/attendance/qr/submit     (Student)
POST   /api/attendance/camera        (Camera worker)

GET    /api/bookings
POST   /api/bookings
PUT    /api/bookings/:id             (Approve/reject)

GET    /api/complaints
POST   /api/complaints
PUT    /api/complaints/:id

GET    /api/announcements
POST   /api/announcements

GET    /api/analytics/overview
GET    /api/analytics/attendance
GET    /api/analytics/labs
GET    /api/analytics/equipment
GET    /api/analytics/complaints
GET    /api/analytics/heatmap
GET    /api/analytics/faculty-perf

GET    /api/audit-logs               (HOD only)
POST   /api/chatbot
```

All routes (except `/auth/login`, `/auth/forgot`, `/auth/reset`) require `Authorization: Bearer <jwt>`.

---

## Security

- JWT (HS256), 7-day expiry, secret in `.env`
- bcrypt (cost 10) for passwords
- Role-based middleware (`requireRole('hod','faculty')`)
- Parameterized queries via `mysql2` — no string concatenation
- Audit log table + DB triggers for sensitive ops
- CORS restricted to `CLIENT_URL`

---

## Production checklist

- [ ] Strong `JWT_SECRET` (32+ random bytes)
- [ ] Real SMTP + Twilio credentials
- [ ] HTTPS reverse proxy (nginx)
- [ ] Run `npm run build` in `frontend/` and serve `dist/` from Express or a CDN
- [ ] Set `NODE_ENV=production`
- [ ] Hook a real face-recognition worker into `/api/attendance/camera`

---

## License

Built for academic exhibition purposes. © Team Chinmay Hegde, 2026.
