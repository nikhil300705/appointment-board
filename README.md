# Appointment Board

A full-stack appointment management board built for the Appening Full Stack Developer Intern practical task.

## Tech Stack

- React + Vite
- Python + FastAPI
- SQLAlchemy
- SQLite by default
- REST API

The backend can also use PostgreSQL/MySQL by changing `DATABASE_URL`.

## Features

- View appointments
- Add appointments
- Edit scheduled appointments
- Mark appointments as completed
- Cancel appointments
- Cancelled appointments remain visible
- Filter by date
- Filter by status
- Required-field validation
- End time must be after start time
- Backend prevents overlapping appointments
- Sample appointments are seeded automatically
- Success and error messages

## Project Structure

```text
appointment-board/
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   └── seed.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Run Backend

```bash
cd backend
python -m venv venv
```

Windows:
```bash
venv\Scripts\activate
```

macOS/Linux:
```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

API will be available at:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

## Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/appointments` | List appointments |
| GET | `/api/appointments/{id}` | Get one appointment |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/{id}` | Edit appointment |
| PATCH | `/api/appointments/{id}/complete` | Mark completed |
| PATCH | `/api/appointments/{id}/cancel` | Cancel appointment |

Filtering:

```text
GET /api/appointments?date=2026-09-12
GET /api/appointments?status=scheduled
GET /api/appointments?date=2026-09-12&status=scheduled
```

## Time Conflict Rule

An appointment conflicts when:

```text
existing.start < new.end
AND
existing.end > new.start
AND
existing.date == new.date
```

Cancelled appointments are ignored for conflict checking because they no longer occupy the time slot.

For example:

```text
10:00 - 11:00
```

conflicts with:

```text
10:30 - 11:30
```

but does not conflict with:

```text
11:00 - 12:00
```

## Assumptions

1. All appointments use the local time of the team using the application.
2. Appointment times are represented as a start and end time on a single date.
3. Cancelled appointments remain visible as required by the task.
4. Cancelled appointments do not block a future appointment from using the same time.
5. Completed and cancelled appointments cannot be edited.
6. Completed appointments cannot be cancelled.
7. The backend is the source of truth for time-conflict validation.

## Notes

SQLite is used by default so the reviewer can run the assignment without configuring a database server. The SQLAlchemy setup supports switching to PostgreSQL/MySQL through the `DATABASE_URL` environment variable.
