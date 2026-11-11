import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class CollectionPageCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    slug: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None


class CollectionPageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None


class CollectionPageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    slug: str
    title: str
    description: Optional[str] = None
    is_active: bool
    settings: Dict[str, Any]
    created_at: datetime


class PublicCollectionPageResponse(BaseModel):
    slug: str
    title: str
    description: Optional[str] = None
    is_active: bool
    settings: Dict[str, Any]
    organization_name: str
    organization_branding: Dict[str, Any]
