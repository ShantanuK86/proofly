import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user, get_current_org_context, OrganizationContext
from app.models.entities import (
    User,
    Organization,
    OrganizationMember,
    CollectionPage,
    Widget,
    AuditLog,
)
from app.modules.organizations.schemas import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationWithRoleResponse,
    slugify,
)

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    req: OrganizationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    base_slug = req.slug if req.slug else slugify(req.name)
    if not base_slug:
        base_slug = f"org-{uuid.uuid4().hex[:6]}"

    # Check slug collision
    slug = base_slug
    counter = 1
    while True:
        stmt = select(Organization).where(Organization.slug == slug)
        res = await db.execute(stmt)
        if not res.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    org_id = uuid.uuid4()
    branding = req.branding or {
        "primary_color": "#2563EB",
        "accent_color": "#3B82F6",
        "logo_url": None,
        "badge_text": f"Verified by Proofly",
    }

    org = Organization(
        id=org_id,
        name=req.name.strip(),
        slug=slug,
        website_url=req.website_url.strip() if req.website_url else None,
        branding=branding,
    )
    db.add(org)

    # Add owner membership
    member = OrganizationMember(
        organization_id=org_id,
        user_id=user.id,
        role="OWNER",
    )
    db.add(member)

    # Create default collection page
    col_page = CollectionPage(
        id=uuid.uuid4(),
        organization_id=org_id,
        slug=slug,
        title=f"Review {org.name}",
        description=f"We appreciate your honest feedback. Your review helps us improve and helps others make informed choices.",
        is_active=True,
    )
    db.add(col_page)

    # Create default widget
    default_widget = Widget(
        id=uuid.uuid4(),
        organization_id=org_id,
        public_id=f"wdg_{uuid.uuid4().hex[:12]}",
        name="Wall of Love",
        type="WALL",
        settings={
            "theme": "light",
            "accent_color": branding.get("primary_color", "#2563EB"),
            "show_rating": True,
            "show_role": True,
            "show_date": True,
            "card_shadow": True,
            "border_radius": "md",
            "columns": 3,
        },
        is_active=True,
    )
    db.add(default_widget)

    # Audit log
    audit = AuditLog(
        id=uuid.uuid4(),
        organization_id=org_id,
        actor_id=user.id,
        action="organization.created",
        resource_id=str(org_id),
        details={"name": org.name, "slug": org.slug},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(org)

    return OrganizationResponse.model_validate(org)


@router.get("/current", response_model=OrganizationWithRoleResponse)
async def get_current_organization(
    ctx: OrganizationContext = Depends(get_current_org_context),
):
    resp = OrganizationWithRoleResponse(
        id=ctx.organization.id,
        name=ctx.organization.name,
        slug=ctx.organization.slug,
        website_url=ctx.organization.website_url,
        branding=ctx.organization.branding,
        created_at=ctx.organization.created_at,
        updated_at=ctx.organization.updated_at,
        role=ctx.role,
    )
    return resp


@router.patch("/current", response_model=OrganizationResponse)
async def update_current_organization(
    req: OrganizationUpdate,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    if ctx.role not in ("OWNER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization owners and admins can update business settings.",
        )

    org = ctx.organization
    if req.name is not None:
        org.name = req.name.strip()
    if req.website_url is not None:
        org.website_url = req.website_url.strip() if req.website_url else None
    if req.branding is not None:
        # merge branding
        updated_branding = dict(org.branding)
        updated_branding.update(req.branding)
        org.branding = updated_branding

    audit = AuditLog(
        id=uuid.uuid4(),
        organization_id=org.id,
        actor_id=ctx.user.id,
        action="organization.updated",
        resource_id=str(org.id),
        details={"name": org.name},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(org)
    return OrganizationResponse.model_validate(org)


@router.get("", response_model=List[OrganizationWithRoleResponse])
async def list_user_organizations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(OrganizationMember, Organization)
        .join(Organization, OrganizationMember.organization_id == Organization.id)
        .where(OrganizationMember.user_id == user.id)
        .order_by(OrganizationMember.joined_at.asc())
    )
    rows = (await db.execute(stmt)).all()
    results = []
    for member, org in rows:
        results.append(
            OrganizationWithRoleResponse(
                id=org.id,
                name=org.name,
                slug=org.slug,
                website_url=org.website_url,
                branding=org.branding,
                created_at=org.created_at,
                updated_at=org.updated_at,
                role=member.role,
            )
        )
    return results
