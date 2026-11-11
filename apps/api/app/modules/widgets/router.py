import uuid
from datetime import datetime, timezone, date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_org_context, OrganizationContext
from app.models.entities import (
    Widget,
    Organization,
    Testimonial,
    AuditLog,
    DailyStat,
)
from app.modules.testimonials.schemas import PublicTestimonialItem
from app.modules.widgets.schemas import (
    WidgetCreate,
    WidgetUpdate,
    WidgetResponse,
    PublicWidgetResponse,
)

router = APIRouter(tags=["Widgets"])


def generate_embed_snippet(public_id: str) -> str:
    embed_url = f"{settings.WEB_BASE_URL}/embed/{public_id}"
    return (
        f'<iframe\n'
        f'  src="{embed_url}"\n'
        f'  title="Customer Testimonials"\n'
        f'  width="100%"\n'
        f'  height="500"\n'
        f'  loading="lazy"\n'
        f'  style="border:0;width:100%;max-width:100%;display:block;"\n'
        f'></iframe>'
    )


@router.get("/widgets", response_model=List[WidgetResponse])
async def list_widgets(
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Widget)
        .where(Widget.organization_id == ctx.organization_id)
        .order_by(Widget.created_at.desc())
    )
    widgets = (await db.execute(stmt)).scalars().all()
    results = []
    for w in widgets:
        item = WidgetResponse.model_validate(w)
        item.embed_snippet = generate_embed_snippet(w.public_id)
        results.append(item)
    return results


@router.post("/widgets", response_model=WidgetResponse, status_code=status.HTTP_201_CREATED)
async def create_widget(
    req: WidgetCreate,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    if ctx.role not in ("OWNER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can create widgets.",
        )

    public_id = f"wdg_{uuid.uuid4().hex[:14]}"
    default_settings = {
        "theme": "light",
        "accent_color": ctx.organization.branding.get("primary_color", "#2563EB"),
        "show_rating": True,
        "show_role": True,
        "show_date": True,
        "card_shadow": True,
        "border_radius": "md",
        "columns": 3,
    }
    if req.settings:
        default_settings.update(req.settings)

    widget = Widget(
        id=uuid.uuid4(),
        organization_id=ctx.organization_id,
        public_id=public_id,
        name=req.name.strip(),
        type=req.type,
        settings=default_settings,
        is_active=True,
    )
    db.add(widget)

    audit = AuditLog(
        id=uuid.uuid4(),
        organization_id=ctx.organization_id,
        actor_id=ctx.user.id,
        action="widget.created",
        resource_id=str(widget.id),
        details={"name": widget.name, "type": widget.type},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(widget)

    res = WidgetResponse.model_validate(widget)
    res.embed_snippet = generate_embed_snippet(widget.public_id)
    return res


@router.patch("/widgets/{widget_id}", response_model=WidgetResponse)
async def update_widget(
    widget_id: uuid.UUID,
    req: WidgetUpdate,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    if ctx.role not in ("OWNER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can update widgets.",
        )

    stmt = select(Widget).where(
        Widget.id == widget_id,
        Widget.organization_id == ctx.organization_id,
    )
    widget = (await db.execute(stmt)).scalar_one_or_none()
    if not widget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Widget not found",
        )

    if req.name is not None:
        widget.name = req.name.strip()
    if req.type is not None:
        widget.type = req.type
    if req.is_active is not None:
        widget.is_active = req.is_active
    if req.settings is not None:
        updated_settings = dict(widget.settings)
        updated_settings.update(req.settings)
        widget.settings = updated_settings

    await db.commit()
    await db.refresh(widget)

    res = WidgetResponse.model_validate(widget)
    res.embed_snippet = generate_embed_snippet(widget.public_id)
    return res


@router.get("/public/widgets/{public_id}", response_model=PublicWidgetResponse)
async def get_public_widget(
    public_id: str,
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch widget and organization
    stmt = (
        select(Widget, Organization)
        .join(Organization, Widget.organization_id == Organization.id)
        .where(Widget.public_id == public_id)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Widget not found",
        )

    widget, org = row
    if not widget.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This widget has been disabled by its owner.",
        )

    # 2. Retrieve only approved, consented testimonials that are not deleted
    testi_stmt = (
        select(Testimonial)
        .where(
            Testimonial.organization_id == org.id,
            Testimonial.status == "APPROVED",
            Testimonial.publish_consent == True,
            Testimonial.deleted_at.is_(None),
        )
        .order_by(Testimonial.submitted_at.desc())
    )
    testimonials = (await db.execute(testi_stmt)).scalars().all()

    # Public items: NEVER include customer email
    public_items = [
        PublicTestimonialItem(
            id=str(t.id),
            customer_name=t.customer_name,
            customer_role=t.customer_role,
            rating=t.rating,
            content=t.content,
            submitted_at=t.submitted_at,
        )
        for t in testimonials
    ]

    # 3. Coarse daily analytics counter
    today = date.today()
    stat_stmt = select(DailyStat).where(
        DailyStat.organization_id == org.id,
        DailyStat.day == today,
    )
    stat_res = await db.execute(stat_stmt)
    stat_row = stat_res.scalar_one_or_none()
    if stat_row:
        stat_row.widget_views_count += 1
    else:
        new_stat = DailyStat(
            id=uuid.uuid4(),
            organization_id=org.id,
            day=today,
            submissions_count=0,
            widget_views_count=1,
        )
        db.add(new_stat)

    await db.commit()

    return PublicWidgetResponse(
        widget_id=widget.public_id,
        name=widget.name,
        type=widget.type,
        settings=widget.settings,
        organization_name=org.name,
        organization_branding=org.branding,
        testimonials=public_items,
    )
