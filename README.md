<div align="center">

# Health Tracker - MERN + Vite

<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,react,vite" alt="Tech stack icons" />

<br />
<br />

<strong>Smart healthcare platform built for patients, doctors, caregivers, and administrators.</strong>

<br />

React + Vite frontend, Node.js + Express backend, MongoDB persistence, and production deployment on Vercel + Render.

<br />
<br />

<img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="Frontend React and Vite" />
<img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Backend Node.js and Express" />
<img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="Database MongoDB" />
<img src="https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-222222?style=for-the-badge&logo=vercel&logoColor=white" alt="Deployment Vercel and Render" />

<br />

<img src="https://img.shields.io/badge/Auth-JWT%20%2B%20Google%20OAuth-EA4335?style=flat-square&logo=google&logoColor=white" alt="Authentication JWT and Google OAuth" />
<img src="https://img.shields.io/badge/Payments-Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Payments Stripe" />
<img src="https://img.shields.io/badge/Media-Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white" alt="Media Cloudinary" />
<img src="https://img.shields.io/badge/Messaging-Vonage-FE0056?style=flat-square&logo=vonage&logoColor=white" alt="Messaging Vonage" />
<img src="https://img.shields.io/badge/Docs-Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black" alt="Swagger Docs" />

<br />
<br />

<a href="#platform-overview">Overview</a> |
<a href="#installation">Installation</a> |
<a href="#environment-configuration">Environment</a> |
<a href="#running-the-application">Run</a> |
<a href="#deployment-blueprint">Deployment</a> |
<a href="#api-reference">API Reference</a>

</div>

---

## Platform Overview

Health Tracker merges four major project modules into one integrated healthcare system. It supports secure authentication, health monitoring, nutrition workflows, specialist appointments, caregiver coordination, real-time alerts, reporting, and payment processing.

| Module | Owner | Core Scope |
|--------|-------|------------|
| Imasha | Imasha Dulshini | Authentication, users, admin management, reports |
| Tharuka | Tharuka Sanjeewa | Health data, simulator, nutrition, meal plans, meal reminders |
| Priya | Priya | Doctor appointments, exercise tracking, email logs |
| Tharindu | Tharindu | Alerts, notifications, caregiver bookings, Stripe payment |

## System Highlights

| Domain | Capabilities |
|--------|--------------|
| Identity and access | JWT auth, refresh tokens, Google OAuth, email verification, password reset, role-based access |
| Clinical tracking | Manual vitals, simulated readings, PDF-based health uploads, report generation, alert history |
| Nutrition workflows | Meal logging, nutrition checks, recommendations, meal plans, reminder generation |
| Care coordination | Specialist discovery, appointments, caregiver booking requests, notifications, alert acknowledgements |
| Operations and admin | User management, doctor and caregiver management, audit logs, report generation |
| Production readiness | Vercel frontend deployment, Render backend deployment, Swagger docs, third-party integrations |

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, React Router, Framer Motion |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Authentication | JWT, refresh tokens, Google OAuth 2.0 |
| Integrations | Gmail API / SMTP, Cloudinary, Stripe, Vonage, Open Food Facts |
| Deployment | Vercel, Render |

## Architecture Snapshot

```text
+-------------------+        +------------------------+        +------------------+
| React + Vite App  | -----> | Node.js / Express API  | -----> | MongoDB Database |
+-------------------+        +------------------------+        +------------------+
         |                              |                                  |
         |                              |                                  |
         v                              v                                  v
  Vercel Hosting          Auth / Reports / Alerts / Payments      Persistent data layer
                                  |
                                  v
                Google OAuth / Gmail / Cloudinary / Stripe / Vonage
```

## Installation

### Project Structure

```text
Health_Tracker/
|-- Backend/
`-- frontend/
```

### Backend Setup

```bash
cd Backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## Environment Configuration

Create `.env` file inside `Backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/health_tracker
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
COOKIE_SECRET=your_cookie_secret
CLIENT_URL=http://localhost:5173
ADMIN_DASHBOARD_URL=http://localhost:5173/admin/dashboard
PATIENT_HOME_URL=http://localhost:5173
```

Create `.env` file inside `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Application

### Start Backend Server

```bash
cd Backend
npm run dev
```

<kbd>http://localhost:5000</kbd>

### Start Frontend Server

```bash
cd frontend
npm run dev
```

<kbd>http://localhost:5173</kbd>

---

## Build for Production

### Build Frontend

```bash
cd frontend
npm run build
```

**Output Directory:** `frontend/dist`

---

## Deployment Blueprint

### Frontend Deployment on Vercel

The frontend already includes `frontend/vercel.json` with SPA rewrites to `index.html`.

| Setting | Value |
|---------|-------|
| Framework preset | `Vite` |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |

Frontend production environment:

```env
VITE_API_URL=https://<your-render-backend>/api
```

### Backend Deployment on Render

| Setting | Value |
|---------|-------|
| Service type | `Web Service` |
| Root directory | `Backend` |
| Build command | `npm install` |
| Start command | `npm start` |

Backend production environment:

```env
PORT=10000
NODE_ENV=production
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
REFRESH_TOKEN_SECRET=<your_refresh_secret>
COOKIE_SECRET=<your_cookie_secret>
CLIENT_URL=https://<your-vercel-frontend>
ADMIN_DASHBOARD_URL=https://<your-vercel-frontend>/admin/dashboard
PATIENT_HOME_URL=https://<your-vercel-frontend>
GOOGLE_CALLBACK_URL=https://<your-render-backend>/api/auth/google/callback
```

Optional production integrations:

```env
EMAIL_USER=<smtp_or_google_sender_email>
EMAIL_PASSWORD=<smtp_password>
EMAIL_FROM=<sender_email>
GOOGLE_CLIENT_ID=<google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<google_oauth_client_secret>
GOOGLE_REFRESH_TOKEN=<gmail_api_refresh_token>
CLOUDINARY_CLOUD_NAME=<cloudinary_name>
CLOUDINARY_API_KEY=<cloudinary_key>
CLOUDINARY_API_SECRET=<cloudinary_secret>
STRIPE_SECRET_KEY=<stripe_secret_key>
VONAGE_API_KEY=<vonage_key>
VONAGE_API_SECRET=<vonage_secret>
CALORIENINJAS_API_KEY=<optional_nutrition_api_key>
```

### Recommended Deploy Order

1. Deploy the backend to Render.
2. Copy the Render backend URL into frontend `VITE_API_URL`.
3. Deploy the frontend to Vercel.
4. Update backend `CLIENT_URL`, dashboard URLs, and `GOOGLE_CALLBACK_URL` to match the live frontend and backend domains.

---

## API Reference

<div align="left">

<table>
<tr>
<td><strong>Base URL</strong></td>
<td><kbd>http://localhost:5000</kbd></td>
</tr>
<tr>
<td><strong>Frontend URL</strong></td>
<td><kbd>http://localhost:5173</kbd></td>
</tr>
</table>

---

### Authorization

All private endpoints require this header:

```http
Authorization: Bearer <token>
```

---

### Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access |
| `doctor` | Own profile and linked patients |
| `patient` | Own health, appointments, nutrition, reports, and bookings |
| `caregiver` | Own profile and linked patient booking flow |

---

### Security

![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=jsonwebtokens)
![bcrypt](https://img.shields.io/badge/bcrypt-12_rounds-blue?style=flat-square)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-2.0-red?style=flat-square&logo=google)

- JWT-based authentication
- Refresh tokens persisted in database
- HTTP-only refresh token cookies
- Password hashing with bcrypt
- Email verification before first login
- Password reset flow
- Google OAuth 2.0 login
- Role-based access control
- Account lockout after repeated failed login attempts

---

<details>
<summary><strong>Imasha Module</strong> - Authentication, User Management, Admin Management, Reports</summary>

<br />

<table>
<tr>
<td><strong>Developer</strong></td>
<td>Imasha Dulshini</td>
</tr>
<tr>
<td><strong>Module</strong></td>
<td>Authentication, User Management, Admin Management, Reports</td>
</tr>
<tr>
<td><strong>Base URL</strong></td>
<td><kbd>http://localhost:5000</kbd></td>
</tr>
</table>

### Authentication - `/api/auth`

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/register` | `Public` | Register new patient and send email verification link |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/login` | `Public` | Login for all roles |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/logout` | `Authenticated` | Logout authenticated user |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/refresh` | `Public` | Refresh access token |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/auth/verify-email/:token` | `Public` | Verify email by token |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/verify-email` | `Public` | Verify email by token in request body |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/forgot-password` | `Public` | Send password reset link |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/reset-password` | `Public` | Reset password with token |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/auth/google` | `Public` | Start Google OAuth flow |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/auth/google/callback` | `Public` | Google OAuth callback |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/auth/me` | `Authenticated` | Get current authenticated user |

### User Management - `/api/users`

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/users` | `Admin` | Get all users with filters and pagination |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/users/doctors` | `Authenticated` | Get active specialist doctors |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/users/:id` | `Authenticated` | Get one user by ID |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/users/:id` | `Authenticated` | Update user profile |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/users/:id/profile-image` | `Authenticated` | Upload or update profile image |
| ![PATCH](https://img.shields.io/badge/PATCH-50e3c2?style=flat-square&logoColor=white) | `/api/users/:id/onboarding` | `Authenticated` | Mark onboarding complete |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/users/:id` | `Admin` | Soft delete a user |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/users/link/doctor-patient` | `Admin` | Link doctor to patient |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/users/link/caregiver-patient` | `Admin` | Assign caregiver to patient |

### Admin Management - `/api/admin`

**Doctor Management**

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/admin/doctors` | `Admin` | Create doctor |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/doctors` | `Admin` | Get all doctors |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/doctors/:id` | `Admin` | Get doctor by ID |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/admin/doctors/:id` | `Admin` | Update doctor |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/admin/doctors/:id` | `Admin` | Soft delete doctor |

**Caregiver Management**

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/admin/caregivers` | `Admin` | Create caregiver |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/caregivers` | `Admin` | Get all caregivers |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/caregivers/:id` | `Admin` | Get caregiver by ID |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/admin/caregivers/:id` | `Admin` | Update caregiver |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/admin/caregivers/:id` | `Admin` | Soft delete caregiver |

**Audit Logs**

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/audit-logs` | `Admin` | Get system audit logs |

### Reports - `/api/reports`

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/reports/generate` | `Admin` | Generate report |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports` | `Authenticated` | Get reports |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/:id` | `Authenticated` | Get report by ID |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/:id/pdf` | `Authenticated` | Download report as PDF |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/reports/:id` | `Authenticated` | Delete report |

> **Report Types:** `user_activity` | `system`

</details>

---

<details>
<summary><strong>Tharuka Module</strong> - Health Data, Simulator, Reports, Nutrition, Meal Plans, Meal Reminders</summary>

<br />

<table>
<tr>
<td><strong>Developer</strong></td>
<td>Tharuka Sanjeewa</td>
</tr>
<tr>
<td><strong>Module</strong></td>
<td>Health Data, Simulator, Reports, Nutrition, Meal Plans, Meal Reminders</td>
</tr>
<tr>
<td><strong>Base URL</strong></td>
<td><kbd>http://localhost:5000</kbd></td>
</tr>
</table>

### Health Data - `/api/health-data`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/health-data/manual` | Save manual vitals |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/health-data/pdf-upload` | Upload PDF and extract vitals |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/health-data/:userId` | Get health records for user |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/health-data/record/:id` | Get single health record |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/health-data/alerts/:userId` | Get alert history |
| ![PATCH](https://img.shields.io/badge/PATCH-50e3c2?style=flat-square&logoColor=white) | `/api/health-data/alerts/:alertId/resolve` | Resolve health alert history item |

### Simulator - `/api/health-data`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/health-data/simulator` | Generate one simulated reading |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/health-data/simulator/bulk` | Generate multiple simulated readings |

### Health Reports - `/api/reports`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/weekly/:userId` | Weekly health report |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/monthly/:userId` | Monthly health report |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/export/pdf/:userId` | Export health report PDF |

### Nutrition - `/api/nutrition`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/nutrition` | Log meal |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/nutrition/check` | Check nutrition values for meal items |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/nutrition/:userId` | Get user nutrition logs |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/nutrition/analysis/:userId` | Weekly or monthly nutrition analysis |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/nutrition/:id` | Update meal |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/nutrition/:id` | Delete meal |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/nutrition/:id/recommendation` | Add doctor recommendation to meal |

> **Meal Types:** `breakfast` | `lunch` | `dinner` | `snack`

### Meal Plans - `/api/meal-plans`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/meal-plans` | Create meal plan |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/meal-plans/suggest/:userId` | Generate meal plan suggestions |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-plans/:userId` | Get user meal plans |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-plans/detail/:id` | Get meal plan by ID |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-plans/health-condition/:userId/:healthCondition` | Filter plans by health condition |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/meal-plans/:id` | Update meal plan |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/meal-plans/:id` | Delete meal plan |

> **Health Conditions:** `diabetes`, `hypertension`, `obesity`, `heart_disease`, `kidney_disease`, `celiac`, `lactose_intolerant`, `high_cholesterol`, `anemia`, `osteoporosis`, `other`

### Meal Reminders - `/api/meal-reminders`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-reminders/:userId` | Get reminders |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/meal-reminders/generate/:userId` | Generate reminders from active meal plans |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/meal-reminders/:id/complete` | Mark reminder completed |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/meal-reminders/:id/skip` | Mark reminder skipped |

</details>

---

<details>
<summary><strong>Priya Module</strong> - Appointments, Exercise Tracking, Email Logs</summary>

<br />

<table>
<tr>
<td><strong>Developer</strong></td>
<td>Priya</td>
</tr>
<tr>
<td><strong>Module</strong></td>
<td>Appointments, Exercise Tracking, Email Logs</td>
</tr>
<tr>
<td><strong>Base URL</strong></td>
<td><kbd>http://localhost:5000</kbd></td>
</tr>
</table>

### Appointments - `/api/appointments`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/appointments` | Get appointments |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/appointments/:id` | Get appointment by ID |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/appointments` | Create appointment |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/appointments/:id` | Update appointment |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/appointments/:id/cancel` | Cancel appointment |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/appointments/:id` | Delete appointment |

### Admin Appointment Actions - `/api/admin/appointments`

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/appointments/pending` | `Admin` | Get pending appointments |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/appointments` | `Admin` | Get all appointments |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/admin/appointments/:id/approve` | `Admin` | Approve appointment |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/admin/appointments/:id/reject` | `Admin` | Reject appointment |

### Exercise - `/api/exercise`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/exercise` | Get exercise logs |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/exercise/stats` | Get exercise stats |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/exercise` | Create exercise log |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/exercise/:id` | Update exercise log |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/exercise/:id` | Delete exercise log |

### Email Logs - `/api/email-logs`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/email-logs` | Get email log entries |

</details>

---

<details>
<summary><strong>Tharindu Module</strong> - Alerts, Notifications, Caregiver Bookings, Payments</summary>

<br />

<table>
<tr>
<td><strong>Developer</strong></td>
<td>Tharindu</td>
</tr>
<tr>
<td><strong>Module</strong></td>
<td>Alerts, Notifications, Caregiver Bookings, Payments</td>
</tr>
<tr>
<td><strong>Base URL</strong></td>
<td><kbd>http://localhost:5000</kbd></td>
</tr>
</table>

### Alerts - `/api/alerts`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/alerts` | Generate alert manually |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/alerts` | Get alerts |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/alerts/:id` | Get alert by ID |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/alerts/:id` | Update alert status |
| ![PATCH](https://img.shields.io/badge/PATCH-50e3c2?style=flat-square&logoColor=white) | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| ![PATCH](https://img.shields.io/badge/PATCH-50e3c2?style=flat-square&logoColor=white) | `/api/alerts/:id/resolve` | Resolve alert |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/alerts/:id` | Delete alert |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/alerts/all` | Delete all alerts |

### Alert Settings - `/api/alert-settings`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/alert-settings/:userId` | Get per-user thresholds |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/alert-settings/:userId` | Update per-user thresholds |

### Notifications - `/api/notifications`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/notifications/:userId` | Get notifications |
| ![PATCH](https://img.shields.io/badge/PATCH-50e3c2?style=flat-square&logoColor=white) | `/api/notifications/:id/read` | Mark notification read |
| ![PATCH](https://img.shields.io/badge/PATCH-50e3c2?style=flat-square&logoColor=white) | `/api/notifications/user/:userId/read-all` | Mark all notifications read |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/notifications/:id` | Delete one notification |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/notifications/user/:userId` | Clear all notifications |

### Caregiver Bookings - `/api/tharindu/bookings`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/tharindu/bookings/caregivers` | Get available caregivers |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/tharindu/bookings/request` | Request caregiver booking |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/tharindu/bookings/my-bookings` | Get my bookings |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/tharindu/bookings/my-bookings/report` | Download booking report PDF |
| ![PATCH](https://img.shields.io/badge/PATCH-50e3c2?style=flat-square&logoColor=white) | `/api/tharindu/bookings/status/:bookingId` | Update booking status |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/tharindu/bookings/:bookingId` | Delete booking |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/tharindu/bookings/admin/all` | Admin view of all caregiver bookings |

### Payments - `/api/tharindu/payment`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/tharindu/payment/create-intent` | Create Stripe payment intent |

</details>

---

### Swagger / OpenAPI Docs

Available locally after starting the backend:

| Module | Local Docs URL |
|--------|----------------|
| Imasha | `http://localhost:5000/api-docs/imasha` |
| Tharuka | `http://localhost:5000/api-docs/Tharuka` |
| Priya | `http://localhost:5000/api-docs/priya` |
| Tharindu | `http://localhost:5000/api-docs/tharindu` |

---

### Notes

- The backend folder name in this repo is `Backend`, not `backend`.
- The frontend expects `VITE_API_URL` to point to the backend `/api` base.
- The frontend Vite config and backend config already contain Render and Vercel-oriented defaults for production deployment.

</div>

---

<div align="center">

<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />

</div>
