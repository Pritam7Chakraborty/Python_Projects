from datetime import datetime, timezone
from typing import Optional, List
from uuid import uuid4

from sqlmodel import SQLModel, Field, Relationship

def _uuid() -> str:
    return str(uuid4())

def _now() -> datetime:
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    credits: int = Field(default=5, ge=0)
    created_at: datetime = Field(default_factory=_now)

    jobs: List["Job"] = Relationship(back_populates="user")
    transactions: List["CreditTransaction"] = Relationship(back_populates="user")

class CreditTransaction(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)

    amount: int
    reason: str = Field(description="e.g., 'signup_bonus', 'job_generation', 'stripe_refill'")
    reference_id: Optional[str] = Field(default=None, description="The job_id or payment_id")
    created_at: datetime = Field(default_factory=_now)

    user: Optional[User] = Relationship(back_populates="transactions")

class Thumbnail(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    job_id: str = Field(foreign_key="job.id")
    style_name: str = Field(default="default")
    imagekit_url: Optional[str] = Field(default=None)
    status: str = Field(default="pending")
    error: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=_now)

    job: Optional["Job"] = Relationship(back_populates="thumbnails")

class Job(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    
    prompt: str = Field(default="")
    num_thumbnails: int = Field(default=1, ge=1, le=3)
    headshot_url: str = Field(default="")
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=_now)
    
    user: Optional[User] = Relationship(back_populates="jobs")
    thumbnails: List[Thumbnail] = Relationship(back_populates="job")