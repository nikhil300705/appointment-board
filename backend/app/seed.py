from datetime import date, time
from sqlalchemy.orm import Session
from .models import Appointment

def seed_sample_appointments(db: Session):
    if db.query(Appointment).count() > 0:
        return

    samples = [
        Appointment(
            title="Team Stand-up",
            description="Daily engineering sync.",
            date=date.today(),
            start_time=time(9, 30),
            end_time=time(10, 0),
            status="scheduled",
        ),
        Appointment(
            title="Client Review",
            description="Review project progress and next steps.",
            date=date.today(),
            start_time=time(11, 0),
            end_time=time(12, 0),
            status="scheduled",
        ),
        Appointment(
            title="Design Discussion",
            description="UI feedback and implementation discussion.",
            date=date.today(),
            start_time=time(14, 0),
            end_time=time(15, 0),
            status="completed",
        ),
        Appointment(
            title="Old Demo",
            description="Previous product demonstration.",
            date=date.today(),
            start_time=time(16, 0),
            end_time=time(16, 30),
            status="cancelled",
        ),
    ]
    db.add_all(samples)
    db.commit()
