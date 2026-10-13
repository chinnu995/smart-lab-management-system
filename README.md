# Smart Lab Management System 🚀

A comprehensive, full-stack Smart Lab Management & VTU Curriculum Coding Arena built for engineering institutions. Featuring real-time analytics, VTU Scheme-Aware lab curriculum management, camera/QR attendance, top company placement practice, Kahoot-style live lab quizzes, AI chatbot, and role-based access control.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Socket.io-client
- **Backend:** Node.js, Express.js, JWT Authentication, Bcrypt, Socket.io, Nodemailer (Gmail SMTP / SSL)
- **Database:** **Supabase (PostgreSQL)** with Connection Pooling & SSL (`pg` / `node-postgres`)
- **Code Execution:** Sandboxed multi-language runner (C, C++, Java, Python, JavaScript, SQL)

---

## 🌟 Key Highlights & Features

### 1. VTU Scheme-Aware Coding Arena 💻
- **Strict Scheme Scoping:** Dedicated curriculum mapping for **2022 Scheme** and **2025 Scheme**.
- **Database as Single Source of Truth:** Student's scheme, department, and semester are always resolved from Supabase (`users` and `students` tables via USN branch mapping).
- **Semester Locking:** Students strictly see only lab programs for their current enrolled semester—tampering and cross-semester browsing are blocked both client-side and server-side (HTTP 403 / strict filtering).
- **Semester 1 & 2 First Year Labs Included:**
  - **Semester 1:** Principles of Programming Using C (`BPOPK103` / `1BPOPL107`)
  - **Semester 2:** Python Programming Lab (`BPLCK205B` / `1BPOPL207`)
- **Higher Semester Labs:** Data Structures (`BCSL305`), Object Oriented Programming with Java (`22CSL35`), Analysis & Design of Algorithms (`BCS401`), Database Management Systems, Computer Networks, and more.
- **Elective Selection:** Students can choose or drop department electives in real time.
- **HOD CSV Curriculum Importer:** Upload or paste VTU syllabus CSVs with full dry-run preview, syntax validation, and atomic transactional rollback.

### 2. Top Company Placement Arena 🏢
- **190+ Placement Questions & Patterns:** Categorized by subject (DSA, ADA, DBMS, Java, Python, OS, AI).
- **Top Recruiter Filters:** Filter questions asked by:
  - **Google** (Two Pointers, Sliding Window, Word Break, Tree DP)
  - **Microsoft** (Spiral Matrix, Balanced Parentheses, Merge Intervals, Knapsack)
  - **EdgeVerve Systems** (Currency Denomination Coin Change, Stock Price Monotonic Stack, Subarray Sum, Transaction Audit Log)
  - **Amazon**, **Infosys**, **TCS Digital**, **Goldman Sachs**
- **Full HackerRank-Style IDE:** Custom input support, sample and hidden test case runner, live execution time benchmarking, submission history, and class leaderboard.

### 3. Smart Attendance System 📷
- **QR Code Attendance:** Faculty generates dynamic QR codes with 15-minute expiration; students scan via device camera.
- **Bulk Marking:** Faculty can mark attendance per batch with Present/Absent/Late status.
- **Parent Notifications:** Automatic email and SMS notifications when student attendance drops below 75%.
- **Camera Worker Stub:** Integration hook for automated OpenCV / face-recognition camera devices.

### 4. Interactive Live Kahoot-Style Quiz 🎮
- Real-time multiplayer lab quiz engine powered by Socket.io.
- Faculty/HOD can host live quiz sessions with Game PINs.
- Live leaderboard, player streaks, and instant score updates.

### 5. Lab Management, Equipment & Analytics 📊
- Lab timetable scheduling and student booking requests.
- Real-time approval/rejection alerts via Socket.io.
- Equipment malfunction complaints tracking and status resolution.
- HOD analytics dashboard: attendance trends, lab utilization heatmaps, faculty performance, and tamper-proof audit logs.

---

## 📁 Repository Structure

```
smart-lab-management-system/
├── backend/
│   ├── config/              # Lab config & non-runnable subject mappings
│   ├── scripts/             # Database migrations, seeders, and automated tests
│   │   ├── migrate_vtu_curriculum.js     # VTU curriculum schema migration
│   │   ├── importLabPrograms.js          # CSV lab program importer
│   │   ├── runSchemeCurriculumTests.js   # 17-point automated test suite
│   │   └── seed_placement_challenges.js  # Upserts top company placement questions
│   ├── seed/
│   │   └── data/            # Official VTU 2022 & 2025 CSV syllabus files
│   ├── src/
│   │   ├── config/          # Supabase PostgreSQL connection pool
│   │   ├── controllers/     # Coding, attendance, auth, booking, analytics controllers
│   │   ├── data/            # Placement patterns & starter code templates
│   │   ├── services/        # Multi-language code runner & email services
│   │   └── utils/           # CSV importer, mailer, OTP helpers
│   └── server.js            # Express & Socket.io server entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Navigation, layouts, modals
│   │   ├── pages/
│   │   │   ├── student/     # PracticeSkills, HackerRankIDE, SubjectPrograms, Attendance
│   │   │   ├── faculty/     # MarkAttendance, LabManuals, Complaints
│   │   │   ├── hod/         # Analytics, Students, Faculty, LabManagement
│   │   │   └── kahoot/      # Live multiplayer lab quiz lobby & host
│   │   └── services/        # Axios API client
│   └── vite.config.js       # Vite configuration
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **Supabase Account**: A free Supabase project with PostgreSQL enabled

---

## 🚀 Setup & Installation

### 1. Database Configuration (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database** → **Connection string** (URI).
3. Copy the PostgreSQL connection URI (with Transaction pooler or Session connection).

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=5005
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173

# Email Notifications (Gmail SMTP / SSL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="Smart Lab Admin <your_email@gmail.com>"
```

Install dependencies and run database migrations & seeders:
```bash
npm install

# Run VTU Curriculum Schema Migrations
node scripts/migrate_vtu_curriculum.js

# Import Official VTU Lab Programs (2022 & 2025 Schemes)
npm run seed:labs

# Seed Top Company Placement Questions (Google, Microsoft, EdgeVerve, etc.)
node scripts/seed_placement_challenges.js

# Verify all automated tests pass (17/17)
npm run test:curriculum

# Start backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🧪 Automated Test Suite

The system includes an automated test suite verifying scheme isolation, parameter security, importer idempotency, and semester locking:

```bash
cd backend
node scripts/runSchemeCurriculumTests.js
```

**Test Coverage:**
- ✅ **Test 1:** Scheme scoping isolation (2022 students see only 2022; 2025 see only 2025)
- ✅ **Test 2:** Cross-scheme access prevention (HTTP 403 Forbidden)
- ✅ **Test 3:** Query-parameter tampering prevention (Students locked to DB semester)
- ✅ **Test 4:** Importer idempotency (Re-running import preserves exact counts)
- ✅ **Test 5:** Transactional rollback on malformed CSV rows
- ✅ **Test 6:** Graceful profile completion prompt for users with no scheme set
- ✅ **Test 7:** Semester empty states
- ✅ **Test 8:** Non-runnable program labels & activity subject scoping

---

## 👥 Demo Roles

| Role | Email | Password | Permissions |
|---|---|---|---|
| **HOD** | `hod@lab.edu` | `password123` | Full superadmin access, department analytics, CSV importer, Kahoot quiz host |
| **Faculty** | `faculty@lab.edu` | `password123` | Attendance QR generator, booking approvals, complaint resolution |
| **Student (2022 Scheme)** | `student@lab.edu` | `password123` | Current semester lab programs, EdgeVerve/Google/Microsoft placement arena |

---

## 🔒 Security Best Practices

- Parameterized SQL queries via `pg` (`$1`, `$2`) to eliminate SQL injection risks.
- Passwords hashed using `bcrypt` (10 salt rounds).
- JWT authentication with role-based middleware guards on all protected API endpoints.
- Strict CORS configuration matching `CLIENT_URL`.
- Atomic transactional rollbacks on curriculum updates and submissions.

---

## 📄 License

Developed for academic lab operations and VTU campus recruitment readiness.  
© Smart Lab Management System Team.
