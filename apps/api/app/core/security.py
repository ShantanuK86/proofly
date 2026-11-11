import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException, TenantMismatchException
from app.models.entities import User, Organization, OrganizationMember

security_bearer = HTTPBearer(auto_error=False)


def create_access_token(subject: str, user_id: str, email: str, name: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": subject,
        "uid": user_id,
        "email": email,
        "name": name,
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise UnauthorizedException("Invalid or expired authentication token")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise UnauthorizedException("Missing authentication token")
    
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id_str = payload.get("uid")
    if not user_id_str:
        raise UnauthorizedException("Token payload missing user identifier")
    
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedException("Invalid user ID format in token")
    
    stmt = select(User).where(User.id == user_uuid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        # Check if we should auto-register from token payload (managed auth scenario like Supabase)
        auth_subject = payload.get("sub", str(user_uuid))
        email = payload.get("email", f"{user_uuid}@example.com")
        name = payload.get("name", "User")
        
        user = User(
            id=user_uuid,
            auth_subject=auth_subject,
            email=email,
            name=name,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user


class OrganizationContext:
    def __init__(self, organization: Organization, member: OrganizationMember, user: User):
        self.organization = organization
        self.member = member
        self.user = user
        self.organization_id = organization.id
        self.role = member.role


async def get_current_org_context(
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrganizationContext:
    """
    Resolves the organization context for the authenticated user.
    If X-Organization-Id is provided, validates membership.
    Otherwise defaults to the first organization the user belongs to.
    """
    if x_organization_id:
        try:
            org_uuid = uuid.UUID(x_organization_id)
        except ValueError:
            raise TenantMismatchException("Invalid organization ID format")

        stmt = (
            select(OrganizationMember, Organization)
            .join(Organization, OrganizationMember.organization_id == Organization.id)
            .where(
                OrganizationMember.user_id == user.id,
                OrganizationMember.organization_id == org_uuid,
            )
        )
        res = await db.execute(stmt)
        row = res.first()
        if not row:
            raise TenantMismatchException("You are not a member of this organization")
        member, org = row
        return OrganizationContext(organization=org, member=member, user=user)

    # Default to user's first organization
    stmt = (
        select(OrganizationMember, Organization)
        .join(Organization, OrganizationMember.organization_id == Organization.id)
        .where(OrganizationMember.user_id == user.id)
        .order_by(OrganizationMember.joined_at.asc())
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization found. Please complete organization onboarding first.",
        )
    member, org = row
    return OrganizationContext(organization=org, member=member, user=user)
