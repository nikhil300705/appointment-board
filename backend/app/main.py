from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .routes import router
from .seed import seed_sample_appointments

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Appointment Board API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        seed_sample_appointments(db)
    finally:
        db.close()

@app.get("/api/health")
def health():
    return {"status": "ok"}
