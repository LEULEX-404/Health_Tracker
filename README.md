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

### Tharuka Sanjeewa — Health System APIs

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

---

#### Health Data — `/api/health-data`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/health-data/manual` | Save manual health vitals (heart rate, BP, oxygen, temperature, glucose) |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/health-data/pdf-upload` | Upload PDF report; extract vitals via form-data: `userId`, `pdf` (file) |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/health-data/:userId` | Get all health records for user. Query: `limit`, `source` |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/health-data/record/:id` | Get single health record by ID |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/health-data/alerts/:userId` | Get alert history. Query: `severity`, `resolved`, `limit` |
| ![PATCH](https://img.shields.io/badge/PATCH-fca130?style=flat-square&logoColor=white) | `/api/health-data/alerts/:alertId/resolve` | Mark alert as resolved |

---

#### Simulator — `/api/health-data`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/health-data/simulator` | Generate single simulated reading. Body: `userId`, `scenario` (normal / emergency / oxygen_drop) |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/health-data/simulator/bulk` | Bulk simulate N readings. Body: `userId`, `count`, `scenario` |

---

#### Reports — `/api/reports`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/weekly/:userId` | Get weekly health report |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/monthly/:userId` | Get monthly health report |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/reports/export/pdf/:userId` | Export report as PDF. Query: `type` (weekly / monthly) |

---

#### Nutrition — `/api/nutrition`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/nutrition` | Log meal. Body: `userId`, `mealType`, `mealName`, `items`, `notes` |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/nutrition/:userId` | Get user nutrition records. Query: `date`, `mealType`, `limit`, `page` |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/nutrition/analysis/:userId` | Get nutrition analysis. Query: `type` (weekly / monthly) |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/nutrition/:id` | Update meal. Body: `userId`, `mealType`, `mealName`, `items`, `notes` |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/nutrition/:id` | Delete meal. Body: `userId` |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/nutrition/:id/recommendation` | Add doctor recommendation. Body: `doctorId`, `message`, `targetCalories`, etc. |

> **Meal Types:** `breakfast` &nbsp;|&nbsp; `lunch` &nbsp;|&nbsp; `dinner` &nbsp;|&nbsp; `snack`

---

#### Meal Plans — `/api/meal-plans`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/meal-plans` | Create meal plan. Body: `userId`, `planName`, `mealType`, `mealName`, `healthConditions`, `items`, `scheduledDays`, `scheduledTime` |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-plans/:userId` | Get user meal plans. Query: `healthCondition`, `mealType`, `isActive`, `limit`, `page` |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-plans/detail/:id` | Get meal plan by ID. Query: `userId` |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-plans/suggest/:userId` | Suggest meal plans based on user health conditions |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-plans/health-condition/:userId/:healthCondition` | Get plans by health condition |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/meal-plans/:id` | Update meal plan. Body: `userId`, fields to update |
| ![DELETE](https://img.shields.io/badge/DELETE-f93e3e?style=flat-square&logoColor=white) | `/api/meal-plans/:id` | Delete meal plan. Body: `userId` |

> **Health Conditions:** diabetes, hypertension, obesity, heart_disease, kidney_disease, celiac, lactose_intolerant, high_cholesterol, anemia, osteoporosis, other

---

#### Meal Reminders — `/api/meal-reminders`

| Method | Endpoint | Description |
|:------:|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square&logoColor=white) | `/api/meal-reminders/:userId` | Get user reminders. Query: `status`, `startDate`, `endDate`, `limit`, `page` |
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square&logoColor=white) | `/api/meal-reminders/generate/:userId` | Generate reminders from active meal plans |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/meal-reminders/:id/complete` | Mark reminder completed. Body: `userId` |
| ![PUT](https://img.shields.io/badge/PUT-fca130?style=flat-square&logoColor=white) | `/api/meal-reminders/:id/skip` | Mark reminder skipped. Body: `userId` |

</div>

---

<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />

</div>