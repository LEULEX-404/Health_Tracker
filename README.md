<div align="center">

# Health Tracker — MERN + Vite

<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,react,vite" />

---

## Installation

### Project Structure
```
Health_Tracker/
├── backend/
└── frontend/
```

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

---

## Environment Configuration

Create `.env` file inside `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/health_tracker
```

---

## Running the Application

### Start Backend Server
```bash
cd backend
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

## API Reference

<div align="left">

<table>
<tr>
<td>

**Developer**

</td>
<td>Imasha Dulshini</td>
</tr>
<tr>
<td>

**Module**

</td>
<td>Authentication & User Management & Reports</td>
</tr>
<tr>
<td>

**Base URL**

</td>
<td><kbd>http://localhost:5000</kbd></td>
</tr>
</table>

---

### Authorization

All private endpoints require this header:

```http
Authorization: Bearer 
```

---

### Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to all endpoints |
| `doctor` | Own profile and linked patients |
| `patient` | Own profile and own reports |
| `caregiver` | Own profile and linked patients |

---

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/register` | `Public` | Register new patient. Sends email verification link |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/login` | `Public` | Login for all roles. Returns JWT + role-based redirect URL |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/logout` | `Authenticated` | Logout and invalidate refresh token |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/refresh` | `Public` | Get new access token using refresh token |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/auth/verify-email/:token` | `Public` | Verify email address using token sent to inbox |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/forgot-password` | `Public` | Send password reset link to registered email |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/auth/reset-password` | `Public` | Reset password using token received from email |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/auth/google` | `Public` | Initiate Google OAuth login / registration flow |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/auth/google/callback` | `Public` | Google OAuth callback — auto handles new & existing users |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/auth/me` | `Authenticated` | Get currently logged in user profile |

---

### User Management — `/api/users`

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/users` | `Admin` | Get all users with pagination, search and filters |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/users/:id` | `Authenticated` | Get user by ID with linked doctor, patients and caregiver |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/users/:id` | `Authenticated` | Update profile details (name, phone, DOB, gender, address) |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/users/:id/profile-image` | `Authenticated` | Upload or update profile image (JPG, PNG, WEBP — max 5MB) |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/users/:id` | `Admin` | Soft delete a user account |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/users/link/doctor-patient` | `Admin` | Link a doctor to a patient |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/users/link/caregiver-patient` | `Admin` | Assign a caregiver to a patient |

---

### Admin Management — `/api/admin`

**Doctor Management**

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/admin/doctors` | `Admin` | Create a new doctor |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/doctors` | `Admin` | Get all doctors with pagination, search and filters |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/doctors/:id` | `Admin` | Get doctor by ID with linked patients |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/admin/doctors/:id` | `Admin` | Update doctor details |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/admin/doctors/:id` | `Admin` | Soft delete a doctor and unlink from patients |

**Caregiver Management**

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/admin/caregivers` | `Admin` | Create a new caregiver |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/caregivers` | `Admin` | Get all caregivers with pagination, search and filters |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/admin/caregivers/:id` | `Admin` | Get caregiver by ID with linked patients |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/admin/caregivers/:id` | `Admin` | Update caregiver details |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/admin/caregivers/:id` | `Admin` | Soft delete a caregiver and unlink from patients |

---

### Reports — `/api/reports`

| Method | Endpoint | Access | Description |
|:------:|----------|:------:|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/reports/generate` | `Admin` | Generate user activity or system report for a date range |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports` | `Authenticated` | Get all reports. Admin sees all, patients see own only |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/:id` | `Authenticated` | Get full report with data and summary statistics |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/reports/:id` | `Authenticated` | Delete report. Patients can only delete their own |

> **Report Types:** `user_activity` — registrations, logins, active users &nbsp;|&nbsp; `system` — health stats, growth, error logs

---

### Security

![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=jsonwebtokens)
![bcrypt](https://img.shields.io/badge/bcrypt-12_rounds-blue?style=flat-square)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-2.0-red?style=flat-square&logo=google)

- JWT Access Tokens — 15 min expiry
- Refresh Tokens — 7 day expiry, stored in database
- HTTP-only cookies for refresh tokens
- Account lockout after 5 failed login attempts
- Email verification required before first login
- Password hashing with bcrypt (12 salt rounds)
- Google OAuth 2.0 single sign-on

</div>

---

<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />

</div>