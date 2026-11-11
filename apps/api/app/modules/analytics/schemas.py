from datetime import date
from typing import List, Optional
from pydantic import BaseModel


class AnalyticsOverviewResponse(BaseModel):
    total_received: int
    total_published: int
    total_pending: int
    total_rejected: int
    approval_rate_percent: float
    average_rating: float
    total_widget_views: int
    active_collection_slug: Optional[str] = None


class DailyStatPoint(BaseModel):
    day: date
    submissions: int
    views: int


class TimeseriesResponse(BaseModel):
    data: List[DailyStatPoint]
