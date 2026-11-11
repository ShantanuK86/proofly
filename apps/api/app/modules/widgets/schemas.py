import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict

from app.modules.testimonials.schemas import PublicTestimonialItem


class WidgetCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    type: str = Field("WALL", pattern="^(WALL|CAROUSEL)$")
    settings: Optional[Dict[str, Any]] = None


class WidgetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    type: Optional[str] = Field(None, pattern="^(WALL|CAROUSEL)$")
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class WidgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    public_id: str
    name: str
    type: str
    settings: Dict[str, Any]
    is_active: bool
    created_at: datetime
    embed_snippet: Optional[str] = None


class PublicWidgetResponse(BaseModel):
    widget_id: str
    name: str
    type: str
    settings: Dict[str, Any]
    organization_name: str
    organization_branding: Dict[str, Any]
    testimonials: List[PublicTestimonialItem]
