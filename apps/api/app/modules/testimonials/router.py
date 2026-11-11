import uuid
from datetime import datetime, timezone, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func

from app.core.database import get_db
from app.core.security import get_current_org_context, OrganizationContext
from app.integrations.rate_limiter import check_submission_rate_limit
from app.models.entities import (
    CollectionPage,
    Testimonial,
    AuditLog,
    DailyStat,
)
from app.modules.notifications.service import enqueue_submission_notification
from app.modules.testimonials.schemas import (
    TestimonialSubmitRequest,
    TestimonialSubmitResponse,
    TestimonialStatusUpdate,
    TestimonialResponse,
)

router = APIRouter(tags=["Testimonials"])


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@router.post(
    "/public/collection-pages/{slug}/testimonials",
    response_model=TestimonialSubmitResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_public_testimonial(
    slug: str,
    req: TestimonialSubmitRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    # 1. Anti-spam honeypot check: Bots usually fill hidden inputs
    if req.website_hp:
        # Silently reject or simulate success to not clue in automated scrapers
        return TestimonialSubmitResponse(
            id=uuid.uuid4(),
            status="PENDING",
            message="Thank you. Your testimonial was received.",
        )

    # 2. Rate limiting check per IP
    check_submission_rate_limit(request)

    # 3. Lookup collection page
    stmt = select(CollectionPage).where(CollectionPage.slug == slug)
    res = await db.execute(stmt)
    page = res.scalar_one_or_none()
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection page not found",
        )

    if not page.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This review collection page is currently not accepting new submissions.",
        )

    # 4. Create pending testimonial
    testimonial_id = uuid.uuid4()
    now = utc_now()
    testimonial = Testimonial(
        id=testimonial_id,
        organization_id=page.organization_id,
        collection_page_id=page.id,
        customer_name=req.customer_name.strip(),
        customer_email=str(req.customer_email).strip() if req.customer_email else None,
        customer_role=req.customer_role.strip() if req.customer_role else None,
        rating=req.rating,
        content=req.content.strip(),
        status="PENDING",
        publish_consent=req.publish_consent,
        consent_version=req.consent_version,
        consent_at=now,
        submitted_at=now,
    )
    db.add(testimonial)

    # 5. Audit Log for submission
    audit = AuditLog(
        id=uuid.uuid4(),
        organization_id=page.organization_id,
        actor_id=None,
        action="testimonial.submitted",
        resource_id=str(testimonial_id),
        details={
            "customer_name": testimonial.customer_name,
            "rating": testimonial.rating,
            "page_slug": page.slug,
        },
    )
    db.add(audit)

    # 6. Update Daily Stat
    today = date.today()
    stat_stmt = select(DailyStat).where(
        DailyStat.organization_id == page.organization_id,
        DailyStat.day == today,
    )
    stat_res = await db.execute(stat_stmt)
    stat_row = stat_res.scalar_one_or_none()
    if stat_row:
        stat_row.submissions_count += 1
    else:
        new_stat = DailyStat(
            id=uuid.uuid4(),
            organization_id=page.organization_id,
            day=today,
            submissions_count=1,
            widget_views_count=0,
        )
        db.add(new_stat)

    # Atomic commit
    await db.commit()

    # Async notification
    await enqueue_submission_notification(
        organization_id=str(page.organization_id),
        customer_name=testimonial.customer_name,
        rating=testimonial.rating,
        content_preview=testimonial.content,
    )

    return TestimonialSubmitResponse(
        id=testimonial_id,
        status="PENDING",
        message="Thank you. Your testimonial was received.",
    )


@router.get("/testimonials", response_model=List[TestimonialResponse])
async def list_testimonials(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    query = select(Testimonial).where(
        Testimonial.organization_id == ctx.organization_id,
        Testimonial.deleted_at.is_(None),
    )

    if status_filter and status_filter.upper() in ("PENDING", "APPROVED", "REJECTED"):
        query = query.where(Testimonial.status == status_filter.upper())

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Testimonial.customer_name.ilike(search_pattern),
                Testimonial.content.ilike(search_pattern),
                Testimonial.customer_role.ilike(search_pattern),
            )
        )

    query = query.order_by(Testimonial.submitted_at.desc())
    results = (await db.execute(query)).scalars().all()
    return [TestimonialResponse.model_validate(t) for t in results]


@router.get("/testimonials/{testimonial_id}", response_model=TestimonialResponse)
async def get_testimonial(
    testimonial_id: uuid.UUID,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Testimonial).where(
        Testimonial.id == testimonial_id,
        Testimonial.organization_id == ctx.organization_id,
        Testimonial.deleted_at.is_(None),
    )
    testimonial = (await db.execute(stmt)).scalar_one_or_none()
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found in your organization",
        )
    return TestimonialResponse.model_validate(testimonial)


@router.patch("/testimonials/{testimonial_id}/status", response_model=TestimonialResponse)
async def update_testimonial_status(
    testimonial_id: uuid.UUID,
    req: TestimonialStatusUpdate,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    if ctx.role not in ("OWNER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can moderate testimonials.",
        )

    stmt = select(Testimonial).where(
        Testimonial.id == testimonial_id,
        Testimonial.organization_id == ctx.organization_id,
        Testimonial.deleted_at.is_(None),
    )
    testimonial = (await db.execute(stmt)).scalar_one_or_none()
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found",
        )

    # Verification rule from PRD:
    # "approving a testimonial means the customer actually submitted it and consented to publication"
    if req.status == "APPROVED" and not testimonial.publish_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot approve a testimonial that lacks explicit customer publication consent.",
        )

    prev_status = testimonial.status
    testimonial.status = req.status
    testimonial.reviewed_at = utc_now()
    testimonial.reviewed_by = ctx.user.id

    # Record audit log
    audit = AuditLog(
        id=uuid.uuid4(),
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        action=f"testimonial.{req.status.lower()}",
        resource_id=str(testimonial.id),
        details={
            "previous_status": prev_status,
            "new_status": req.status,
            "customer_name": testimonial.customer_name,
        },
    )
    db.add(audit)

    await db.commit()
    await db.refresh(testimonial)
    return TestimonialResponse.model_validate(testimonial)


@router.delete("/testimonials/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testimonial(
    testimonial_id: uuid.UUID,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    if ctx.role not in ("OWNER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can delete testimonials.",
        )

    stmt = select(Testimonial).where(
        Testimonial.id == testimonial_id,
        Testimonial.organization_id == ctx.organization_id,
        Testimonial.deleted_at.is_(None),
    )
    testimonial = (await db.execute(stmt)).scalar_one_or_none()
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found",
        )

    testimonial.deleted_at = utc_now()

    audit = AuditLog(
        id=uuid.uuid4(),
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        action="testimonial.deleted",
        resource_id=str(testimonial.id),
        details={"customer_name": testimonial.customer_name},
    )
    db.add(audit)

    await db.commit()
    return None
