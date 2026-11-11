import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_org_context, OrganizationContext
from app.models.entities import CollectionPage, Organization, AuditLog
from app.modules.collection_pages.schemas import (
    CollectionPageCreate,
    CollectionPageUpdate,
    CollectionPageResponse,
    PublicCollectionPageResponse,
)
from app.modules.organizations.schemas import slugify

router = APIRouter(tags=["Collection Pages"])


@router.get("/collection-pages", response_model=List[CollectionPageResponse])
async def list_collection_pages(
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CollectionPage)
        .where(CollectionPage.organization_id == ctx.organization_id)
        .order_by(CollectionPage.created_at.desc())
    )
    pages = (await db.execute(stmt)).scalars().all()
    return [CollectionPageResponse.model_validate(p) for p in pages]


@router.post("/collection-pages", response_model=CollectionPageResponse, status_code=status.HTTP_201_CREATED)
async def create_collection_page(
    req: CollectionPageCreate,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    if ctx.role not in ("OWNER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can create collection pages.",
        )

    base_slug = req.slug if req.slug else slugify(req.title)
    if not base_slug:
        base_slug = f"page-{uuid.uuid4().hex[:6]}"

    # Check slug collision
    slug = base_slug
    counter = 1
    while True:
        stmt = select(CollectionPage).where(CollectionPage.slug == slug)
        res = await db.execute(stmt)
        if not res.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    page = CollectionPage(
        id=uuid.uuid4(),
        organization_id=ctx.organization_id,
        slug=slug,
        title=req.title.strip(),
        description=req.description.strip() if req.description else None,
        is_active=True,
        settings=req.settings
        or {
            "questions": [
                "What problem did our service solve for you?",
                "What specific result or benefit did you achieve?",
                "Would you recommend us to a colleague?",
            ],
            "thank_you_message": "Thank you! Your testimonial has been submitted for review.",
            "submit_button_text": "Submit Review",
        },
    )
    db.add(page)

    audit = AuditLog(
        id=uuid.uuid4(),
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        action="collection_page.created",
        resource_id=str(page.id),
        details={"slug": page.slug, "title": page.title},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(page)
    return CollectionPageResponse.model_validate(page)


@router.patch("/collection-pages/{page_id}", response_model=CollectionPageResponse)
async def update_collection_page(
    page_id: uuid.UUID,
    req: CollectionPageUpdate,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    if ctx.role not in ("OWNER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can update collection pages.",
        )

    stmt = select(CollectionPage).where(
        CollectionPage.id == page_id,
        CollectionPage.organization_id == ctx.organization_id,
    )
    page = (await db.execute(stmt)).scalar_one_or_none()
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection page not found",
        )

    if req.title is not None:
        page.title = req.title.strip()
    if req.description is not None:
        page.description = req.description.strip()
    if req.is_active is not None:
        page.is_active = req.is_active
    if req.settings is not None:
        updated_settings = dict(page.settings)
        updated_settings.update(req.settings)
        page.settings = updated_settings

    await db.commit()
    await db.refresh(page)
    return CollectionPageResponse.model_validate(page)


@router.get("/public/collection-pages/{slug}", response_model=PublicCollectionPageResponse)
async def get_public_collection_page(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CollectionPage, Organization)
        .join(Organization, CollectionPage.organization_id == Organization.id)
        .where(CollectionPage.slug == slug)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection page not found",
        )

    page, org = row
    return PublicCollectionPageResponse(
        slug=page.slug,
        title=page.title,
        description=page.description,
        is_active=page.is_active,
        settings=page.settings,
        organization_name=org.name,
        organization_branding=org.branding,
    )
