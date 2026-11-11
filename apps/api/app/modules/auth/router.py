import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_access_token, get_current_user
from app.models.entities import User
from app.modules.auth.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="", tags=["Auth"])


@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    stmt = select(User).where(User.email == req.email.lower().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user_id = uuid.uuid4()
    new_user = User(
        id=user_id,
        auth_subject=f"auth_{user_id.hex[:12]}",
        email=req.email.lower().strip(),
        name=req.name.strip(),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(
        subject=new_user.auth_subject,
        user_id=str(new_user.id),
        email=new_user.email,
        name=new_user.name,
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email.lower().strip())
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        # For seamless demo/testing, if user doesn't exist, create automatically
        user_id = uuid.uuid4()
        user_name = req.email.split("@")[0].capitalize()
        user = User(
            id=user_id,
            auth_subject=f"auth_{user_id.hex[:12]}",
            email=req.email.lower().strip(),
            name=user_name,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(
        subject=user.auth_subject,
        user_id=str(user.id),
        email=user.email,
        name=user.name,
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
