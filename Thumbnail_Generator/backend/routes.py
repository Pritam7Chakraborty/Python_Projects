import os
import logging
import asyncio
import json

from fastapi import APIRouter,Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlmodel import Session, select
from pydantic.alias_generators import to_camel
from typing import List
from datetime import datetime

from database import get_session
from models import Job, Thumbnail , User, CreditTransaction

from services.credit_service import add_credits, deduct_credits
from services.generator import process_job, STYLE_ORDER
from services.imagekit_service import upload_file, get_variants
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

#request response schemas

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CreateJobRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    prompt: str
    num_thumbnails: int
    headshot_url: str

class CreateJobResponse(BaseModel):
    job_id: int

##Pyadntic
class ThumbnailResponse(BaseModel):
    id: int
    style_name: str
    status: str
    image_url: str | None = None
    error_message: str | None = None
    variants: dict | None = None

class JobResponse(BaseModel):
    id: int
    prompt: str
    num_thumbnails: int
    headshot_url: str
    thumbnails: list[ThumbnailResponse]
    status: str

class BalanceResponse(BaseModel):
    credits: int
    user_id: str

class TransactionResponse(BaseModel):
    id: str
    amount: int
    reason: str
    reference_id: str | None
    created_at: datetime

class MockPamentPayload(BaseModel):
    user_id: str
    amount: int
    payment_reference_id: str
    secret_token: str

@router.post("/auth/register", response_model=AuthResponse)
def register(request: RegisterRequest, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == request.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=request.email,
        hashed_password=hash_password(request.password),
        credits=5
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    add_credits(session, new_user, amount=5, reason= "signup_bonus")

    token = create_access_token({"sub": new_user.id})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/auth/login", response_model=AuthResponse)
def login(request: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == request.email)).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/upload-headshot")
async def upload_headshot(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
    ):
        content = await file.read()
        url= upload_file(
            file_bytes=content,
            file_name=file.filename or "headshot.jpg",
            folder=f"headshots/{current_user.id}",
            content_type=file.content_type or "image/png",
        )
        return {"url": url}

@router.post("/jobs", response_model=CreateJobResponse)
async def create_job(
    request: CreateJobRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
    ):
    if request.num_thumbnails < 1 or request.num_thumbnails > 3:
        raise HTTPException(status_code=400, detail="Number of thumbnails must be between 1 and 3")
    
    job = Job(
        user_id=current_user.id,
        prompt=request.prompt,
        num_thumbnails=request.num_thumbnails,
        headshot_url=request.headshot_url
    )

    session.add(job)
    session.commit()
    session.refresh(job)

    cost = request.num_thumbnails
    deduct_credits(
        session = session,
        user = current_user,
        amount = cost,
        reason = "job_generation",
        reference_id = job.id
    )

    styles = STYLE_ORDER[:request.num_thumbnails]
    for style in styles:
        thumb = Thumbnail(
            job_id=job.id,
            style_name=style,
        )
        session.add(thumb)

    session.commit()

    # Fire and forget style generation
    asyncio.create_task(process_job(job.id))

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job,job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    thumbnails = session.exec(select(Thumbnail).where(Thumbnail.job_id == job_id)).all()

    thumb_response = []
    for t in thumbnails:
        variants = get_variants(t.imagekit_url) if t.imagekit_url else None
        thumb_response.append(
            ThumbnailResponse(
                id=t.id,
                style_name=t.style_name,
                status=t.status,
                image_url=t.image_url,
                error_message=t.error_message,
                variants=variants
                )
            )
        return JobResponse(
            id=job.id,
            prompt=job.prompt,
            num_thumbnails=job.num_thumbnails,
            headshot_url=job.headshot_url,
            thumbnails=thumb_response,
            status=job.status
            )
    
@router.get("/jobs/{job_id}/stream")
async def stream_job(job_id: str):
    async def event_generator():
        from database import engine
        sent_thumbnails = set()

        while True:
            with Session(engine) as session:
                job =session.get(Job,job_id)
                if not job:
                    yield f"data: error\ndata:{json.dump({'error': 'Job not found'})}\n\n"
                    return
                thumbnails = session.exec(
                    select(Thumbnail).where(Thumbnail.job_id == job_id)
                ).all()
                
                for t in thumbnails:
                    if t.id not in sent_thumbnails:
                        continue
                    if t.status == "uploaded":
                        variants = get_variants(t.imagekit_url)
                        data = json.dumps({
                            "thumbnail_id": t.id,
                            "style_name": t.style_name,
                            "imagekit_url": t.imagekit_url,
                            "variants": variants
                        })
                        yield f"event: thumbnail_ready\n\ndata:{data}"
                        sent_thumbnails.add(t.id)

                    elif t.status == "failed":
                        data = json.dumps({
                            "thumbnail_id": t.id,
                            "style_name": t.style_name,
                            "error": t.error_message

                        })
                        yield f"event: thumbnail_failed\ndata:{data}"
                        sent_thumbnails.add(t.id)
                all_done = all(t.status in ("uploaded","failed") for t in thumbnails)
                if all_done and len(sent_thumbnails) == len(thumbnails):
                    data = json.dumps({"job_id": job_id, "status": job.status})
                    yield f"event: job_completed\ndata:{data}\n\n"
                    return
            await asyncio.sleep(1.5)
                



    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            }
        )

@router.get("/credits/balance", response_model=BalanceResponse)
def get_balance(current_user: User = Depends(get_current_user)):
    return {"credits": current_user.credits, "user_id": current_user.id}

@router.get("/credits/history", response_model=List[TransactionResponse])
def get_transaction_history(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = (
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
    )
    return session.exec(statement).all()


@router.post("/webhooks/mock-payment")
def handle_payment_webhook(
    payload: MockPamentPayload,
    session: Session = Depends(get_session)
):
    """Simulates receiving a successful payment confirmation from Stripe/Razorpay."""
    if payload.secret_token != "mock_secret_webhook_key_123":
        raise HTTPException(status_code=403, detail="Invalid webhook signature")

    existing_tx = session.exec(
        select(CreditTransaction).where(
            CreditTransaction.payment_reference_id == payload.payment_reference_id
        )
    ).first()

    if existing_tx:
        return {"status": "ignored", "detail": "Payment already processed"}

    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    add_credits(
        session=session,
        user=user,
        amount=payload.amount,
        reason="stripe_refill",
        reference_id=payload.payment_reference_id
    )

    return {"status": "success", "detail": "Payment processed successfully"}

