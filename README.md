# Appointment Board

A full-stack appointment management application built for the **Appening Infotech Full Stack Developer Intern practical task**.

The application allows users to create, view, edit, complete, cancel, and filter appointments while enforcing backend validation and preventing overlapping time slots.

---

## 🔗 Live Demo

| Service | Link |
|---|---|
| **Frontend** | https://frontend-kappa-ruby-lp7m9kvk04.vercel.app |
| **Backend API** | https://appointment-board-backend.onrender.com |
| **Swagger API Docs** | https://appointment-board-backend.onrender.com/docs |
| **GitHub Repository** | https://github.com/nikhil300705/appointment-board |

---

## ✨ Key Features

- View all appointments in a dashboard
- Create new appointments
- Edit scheduled appointments
- Mark appointments as completed
- Cancel appointments
- Cancelled appointments remain visible
- Filter appointments by date
- Filter appointments by status
- Search appointments
- Required-field validation
- Start/end time validation
- Backend overlap detection
- Cancelled appointments do not block time slots
- Completed appointments cannot be cancelled
- Completed/cancelled appointments cannot be edited
- Confirmation before cancelling an appointment
- Success and error notifications
- Sample appointments for demonstration
- RESTful API
- Swagger/OpenAPI documentation

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Uvicorn

### Database

- SQLite by default
- SQLAlchemy database abstraction
- PostgreSQL/MySQL compatible through `DATABASE_URL`

### Deployment

- Vercel — Frontend
- Render — Backend

---

## 🏗️ Application Architecture

```text
┌──────────────────────────────────────────────┐
│                  FRONTEND                    │
│                                              │
│              React + Vite                    │
│                                              │
│  Dashboard                                   │
│  Search & Filters                            │
│  Create / Edit                               │
│  Complete / Cancel                           │
│  Notifications                               │
└──────────────────────┬───────────────────────┘
                       │
                       │ REST API / JSON
                       ▼
┌──────────────────────────────────────────────┐
│                  BACKEND                     │
│                                              │
│               FastAPI                        │
│                                              │
│  API Routes                                  │
│  Request Validation                           │
│  Business Rules                              │
│  Conflict Detection                          │
│  Appointment Lifecycle                       │
└──────────────────────┬───────────────────────┘
                       │
                       │ SQLAlchemy
                       ▼
┌──────────────────────────────────────────────┐
│                  DATABASE                    │
│                                              │
│             SQLite (Default)                 │
│                                              │
│       PostgreSQL / MySQL Supported           │
└──────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
appointment-board/
│
├── backend/
│   ├── api/
│   │   └── index.py
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   └── seed.py
│   │
│   ├── appointment.db
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🔄 Appointment Lifecycle

Appointments support the following states:

```text
Scheduled
   │
   ├──────────────► Completed
   │
   └──────────────► Cancelled
```

### Scheduled

A newly created appointment starts with the `scheduled` status.

### Completed

A scheduled appointment can be marked as completed.

### Cancelled

A scheduled appointment can be cancelled.

Cancelled appointments are **not deleted**. They remain visible in the application as required by the assignment.

---

## ⏱️ Time Conflict Prevention

The backend prevents overlapping appointments on the same date.

Two appointments conflict when:

```text
existing.start_time < new.end_time
AND
existing.end_time > new.start_time
AND
existing.date == new.date
```

### Example

This is **not allowed**:

```text
Existing: 10:00 - 11:00
New:      10:30 - 11:30
```

This is allowed:

```text
Existing: 10:00 - 11:00
New:      11:00 - 12:00
```

Cancelled appointments are ignored during conflict checking because they no longer occupy the time slot.

---

## 🔐 Validation & Business Rules

The backend acts as the source of truth for appointment validation.

### Create Appointment

- Required fields must be provided
- End time must be after start time
- Overlapping appointments are rejected
- New appointments start with `scheduled` status

### Edit Appointment

- Only scheduled appointments can be edited
- Time conflicts are checked again
- Completed appointments cannot be edited
- Cancelled appointments cannot be edited

### Complete Appointment

- Scheduled appointments can be completed
- Cancelled appointments cannot be completed

### Cancel Appointment

- Scheduled appointments can be cancelled
- Completed appointments cannot be cancelled
- Cancelled appointments remain visible

---

## 🔎 Filtering & Search

The dashboard supports:

- Date filtering
- Status filtering
- Appointment search

Available statuses:

```text
All
Scheduled
Completed
Cancelled
```

---

## 🌱 Sample Data

The backend includes seed data so the application can be demonstrated immediately after setup.

Sample appointments include different lifecycle states such as:

- Scheduled
- Completed
- Cancelled

This allows the reviewer to see the main functionality without manually creating every appointment.

---

## 🔌 API Reference

Base URL:

```text
/api/appointments
```

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/appointments` | List appointments |
| GET | `/api/appointments/{id}` | Get a single appointment |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/{id}` | Edit appointment |
| PATCH | `/api/appointments/{id}/complete` | Mark appointment completed |
| PATCH | `/api/appointments/{id}/cancel` | Cancel appointment |

### Filtering

Filter by date:

```text
GET /api/appointments?date=2026-09-12
```

Filter by status:

```text
GET /api/appointments?status=scheduled
```

Filter by both:

```text
GET /api/appointments?date=2026-09-12&status=scheduled
```

---

## 🧪 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/nikhil300705/appointment-board.git
cd appointment-board
```

---

### 2. Start the Backend

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

#### macOS / Linux

```bash
source venv/bin/activate
```

#### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## ⚙️ Environment Variables

### Frontend

The frontend uses:

```text
VITE_API_URL
```

Example:

```text
VITE_API_URL=http://localhost:8000
```

For production:

```text
VITE_API_URL=https://appointment-board-backend.onrender.com
```

### Backend

The backend supports:

```text
DATABASE_URL
```

By default, SQLite is used.

Example:

```text
DATABASE_URL=sqlite:///./appointments.db
```

The SQLAlchemy configuration can also be used with supported PostgreSQL/MySQL database URLs.

---

## 🚀 Production Build

To create the frontend production build:

```bash
cd frontend
npm run build
```

The production files are generated in:

```text
frontend/dist/
```

---

## ☁️ Deployment

### Frontend

The React/Vite frontend is deployed using **Vercel**.

Production URL:

https://frontend-kappa-ruby-lp7m9kvk04.vercel.app

### Backend

The FastAPI backend is deployed using **Render**.

Production API:

https://appointment-board-backend.onrender.com

Swagger documentation:

https://appointment-board-backend.onrender.com/docs

---

## 🗄️ Database & Persistence

SQLite is used as the default database to keep local setup simple and avoid requiring a separate database server.

SQLAlchemy provides the database abstraction layer, allowing the application to be configured for PostgreSQL or MySQL using the `DATABASE_URL` environment variable.

For a production system requiring durable persistence on a platform with ephemeral filesystems, a managed PostgreSQL/MySQL database would be recommended.

---

## 🎯 Design Decisions

### Cancel instead of Delete

Appointments are cancelled rather than deleted so that appointment history remains visible.

### Backend Conflict Validation

Time-slot conflicts are checked on the backend rather than relying only on frontend validation.

This prevents invalid overlapping appointments even if the API is called directly.

### SQLite Default

SQLite was selected as the default database because it allows the reviewer to run the project without configuring a separate database server.

### REST API

The frontend communicates with the backend through REST endpoints using JSON, keeping the frontend and backend separated.

---

## 📌 Assumptions

1. Appointment times use the local time of the team using the application.
2. Each appointment belongs to a single calendar date.
3. Appointments contain a start time and end time.
4. Cancelled appointments remain visible.
5. Cancelled appointments do not block the same time slot from being reused.
6. Completed and cancelled appointments cannot be edited.
7. Completed appointments cannot be cancelled.
8. The backend is the source of truth for conflict validation.

---

## ⚠️ Error Handling

The application provides user-friendly error messages for common operations such as:

- Invalid appointment data
- Invalid status filters
- Overlapping appointments
- Missing appointments
- Editing completed/cancelled appointments
- Completing cancelled appointments
- Cancelling completed appointments
- API/server errors

The frontend displays success and error notifications after API operations.

---

## 🔒 Security & Configuration Notes

- Environment-specific configuration is handled through environment variables.
- The frontend does not hard-code the production API URL when deployed.
- Backend validation is performed independently of frontend validation.
- API errors are returned with appropriate HTTP status codes.
- Database configuration is separated from application logic.

---

## ✅ Assignment Requirements Covered

| Requirement | Status |
|---|---|
| View appointments | ✅ |
| Add appointment | ✅ |
| Edit appointment | ✅ |
| Cancel appointment | ✅ |
| Keep cancelled appointments visible | ✅ |
| Mark appointment completed | ✅ |
| Filter by date | ✅ |
| Filter by status | ✅ |
| Prevent duplicate/overlapping time slots | ✅ |
| Sample appointments | ✅ |
| Success/error messages | ✅ |
| REST API | ✅ |
| Backend validation | ✅ |
| Swagger documentation | ✅ |
| Responsive frontend | ✅ |
| Deployed application | ✅ |

---

## 👨‍💻 Author

**Nikhil Eswar**

GitHub:  
https://github.com/nikhil300705

---

## 📋 Assignment Context

This project was developed as part of the **Full Stack Developer Intern practical assignment** for **Appening Infotech**.

The implementation focuses on:

- React frontend development
- FastAPI backend development
- REST API design
- SQLAlchemy database integration
- Appointment business logic
- Backend validation
- Conflict detection
- Deployment
- Clean project documentation
