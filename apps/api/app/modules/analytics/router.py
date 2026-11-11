from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_org_context, OrganizationContext
from app.models.entities import Testimonial, DailyStat, CollectionPage
from app.modules.analytics.schemas import (
    AnalyticsOverviewResponse,
    TimeseriesResponse,
    DailyStatPoint,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    org_id = ctx.organization_id

    # Testimonials counts
    stmt = (
        select(
            Testimonial.status,
            func.count(Testimonial.id),
        )
        .where(
            Testimonial.organization_id == org_id,
            Testimonial.deleted_at.is_(None),
        )
        .group_by(Testimonial.status)
    )
    res = (await db.execute(stmt)).all()
    status_counts = {status: count for status, count in res}

    pending = status_counts.get("PENDING", 0)
    published = status_counts.get("APPROVED", 0)
    rejected = status_counts.get("REJECTED", 0)
    total = pending + published + rejected

    approval_rate = (published / total * 100.0) if total > 0 else 0.0

    # Average rating of approved reviews
    avg_stmt = (
        select(func.avg(Testimonial.rating))
        .where(
            Testimonial.organization_id == org_id,
            Testimonial.status == "APPROVED",
            Testimonial.deleted_at.is_(None),
        )
    )
    avg_res = await db.scalar(avg_stmt)
    average_rating = round(float(avg_res), 2) if avg_res is not None else 5.0

    # Total widget views
    views_stmt = (
        select(func.sum(DailyStat.widget_views_count))
        .where(DailyStat.organization_id == org_id)
    )
    total_views = await db.scalar(views_stmt) or 0

    # Active collection page slug
    page_stmt = (
        select(CollectionPage.slug)
        .where(
            CollectionPage.organization_id == org_id,
            CollectionPage.is_active == True,
        )
        .order_by(CollectionPage.created_at.asc())
    )
    first_page_slug = (await db.execute(page_stmt)).scalar_one_or_none()

    return AnalyticsOverviewResponse(
        total_received=total,
        total_published=published,
        total_pending=pending,
        total_rejected=rejected,
        approval_rate_percent=round(approval_rate, 1),
        average_rating=average_rating,
        total_widget_views=int(total_views),
        active_collection_slug=first_page_slug,
    )


@router.get("/timeseries", response_model=TimeseriesResponse)
async def get_analytics_timeseries(
    days: int = 14,
    ctx: OrganizationContext = Depends(get_current_org_context),
    db: AsyncSession = Depends(get_db),
):
    org_id = ctx.organization_id
    today = date.today()
    start_day = today - timedelta(days=days - 1)

    stmt = (
        select(DailyStat)
        .where(
            DailyStat.organization_id == org_id,
            DailyStat.day >= start_day,
        )
        .order_by(DailyStat.day.asc())
    )
    stats = (await db.execute(stmt)).scalars().all()
    stats_by_day = {s.day: s for s in stats}

    points: List[DailyStatPoint] = []
    for i in range(days):
        current = start_day + timedelta(days=i)
        stat = stats_by_day.get(current)
        points.append(
            DailyStatPoint(
                day=current,
                submissions=stat.submissions_count if stat else 0,
                views=stat.widget_views_count if stat else 0,
            )
        )

    return TimeseriesResponse(data=points)
