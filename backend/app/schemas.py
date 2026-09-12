from datetime import date, time, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, model_validator

Status = Literal["scheduled", "completed", "cancelled"]

class AppointmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(default="", max_length=2000)
    date: date
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("End time must be after start time.")
        return self

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(AppointmentBase):
    pass

class AppointmentOut(AppointmentBase):
    id: int
    status: Status
    created_at: datetime

    model_config = {"from_attributes": True}
