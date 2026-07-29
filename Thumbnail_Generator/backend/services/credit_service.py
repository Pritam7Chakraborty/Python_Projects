from fastapi import HTTPException, status
from sqlmodel import Session
from models import User, CreditTransaction

def add_credits(
        session: Session,
        user : User,
        amount: int,
        reason: str,
        reference_id: str = None
    ) -> User:
    """Safely adds credits to a user balance and logs the transaction."""
    if amount < 0:
        raise ValueError("Deposits must be positive")

    user.credits += amount

    log = CreditTransaction(
        user_id=user.id,
        amount=amount,
        reason=reason,
        reference_id=reference_id
    )

    session.add(user)
    session.add(log)
    session.commit()
    session.refresh(user)
    return user


def deduct_credits(
        session: Session,
        user : User,
        amount: int,
        reason: str,
        reference_id: str = None
    ) -> User:
    """Checks balance, deducts credits, and logs the spend. Raises HTTP 402 (Payment Required) if funds are insufficient."""
    if amount < 0:
        raise ValueError("Deduction amount must be positive")
    if user.credits < amount:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail = f"Insufficient credits. You need {amount} credits, but only have {user.credits} remaining."
        )
    user.credits -= amount

    log = CreditTransaction(
        user_id=user.id,
        amount=-amount,
        reason=reason,
        reference_id=reference_id
        )

    session.add(user)
    session.add(log)
    session.commit()
    session.refresh(user)
    return user