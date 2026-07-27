from datetime import datetime, timezone
from typing import Optional, List
from uuid import uuid4

from sqlmodel import SQLModel, Field, Relationship

def _uuid()-> str:
    return str(uuid4())

def _now() -> datetime:
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=_now)

    jobs: List[Job] = Relationship(back_populates="user")

class Thumbnail(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    job_id: str = Field(foreign_key="Job.id")
    style_name: str = Field(default="default")
    imagekit_url: Optional[str] = Field(default=None)
    status: str = Field(default="pending")
    error: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=_now)

    job: Optional[Job] = Relationship(back_populates="thumbnails")

class Job(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)

    user_id: str = Field(foreign_key="User.id")
    
    prompt: str = Field(default="")
    num_thumbnails: int = Field(default=1, ge=1, le=3)
    headshot: str = Field(default="")
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=_now)
    
    user: Optional[User] = Relationship(back_populates="jobs")
    thumbnails: List[Thumbnail] = Relationship(back_populates="job")