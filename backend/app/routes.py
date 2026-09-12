from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .database import get_db
from .models import Appointment
from .schemas import AppointmentCreate, AppointmentUpdate, AppointmentOut

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

def has_overlap(db: Session, appointment_date, start_time, end_time, exclude_id=None):
    query = db.query(Appointment).filter(
        Appointment.date == appointment_date,
        Appointment.status != "cancelled",
        Appointment.start_time < end_time,
        Appointment.end_time > start_time,
    )
    if exclude_id is not None:
        query = query.filter(Appointment.id != exclude_id)
    return query.first() is not None

@router.get("", response_model=list[AppointmentOut])
def list_appointments(
    date_filter: Optional[date] = Query(default=None, alias="date"),
    status: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Appointment)
    if date_filter:
        query = query.filter(Appointment.date == date_filter)
    if status:
        if status not in {"scheduled", "completed", "cancelled"}:
            raise HTTPException(status_code=400, detail="Invalid status.")
        query = query.filter(Appointment.status == status)
    return query.order_by(Appointment.date, Appointment.start_time).all()

@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    item = db.get(Appointment, appointment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    return item

@router.post("", response_model=AppointmentOut, status_code=201)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    if has_overlap(db, payload.date, payload.start_time, payload.end_time):
        raise HTTPException(status_code=409, detail="This time overlaps another appointment.")
    item = Appointment(**payload.model_dump(), status="scheduled")
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
):
    item = db.get(Appointment, appointment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if item.status != "scheduled":
        raise HTTPException(status_code=400, detail="Only scheduled appointments can be edited.")
    if has_overlap(db, payload.date, payload.start_time, payload.end_time, appointment_id):
        raise HTTPException(status_code=409, detail="This time overlaps another appointment.")

    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

@router.patch("/{appointment_id}/complete", response_model=AppointmentOut)
def complete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    item = db.get(Appointment, appointment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if item.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cancelled appointments cannot be completed.")
    item.status = "completed"
    db.commit()
    db.refresh(item)
    return item

@router.patch("/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db)):
    item = db.get(Appointment, appointment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if item.status == "completed":
        raise HTTPException(status_code=400, detail="Completed appointments cannot be cancelled.")
    item.status = "cancelled"
    db.commit()
    db.refresh(item)
    return item
