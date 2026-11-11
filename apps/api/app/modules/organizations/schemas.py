import uuid
import re
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    slug: Optional[str] = Field(None, min_length=2, max_length=100)
    website_url: Optional[str] = None
    branding: Optional[Dict[str, Any]] = None

    @field_validator("slug", mode="before")
    def validate_slug(cls, v, info):
        if not v:
            return v
        cleaned = slugify(v)
        if len(cleaned) < 2:
            raise ValueError("Slug must be at least 2 alphanumeric characters")
        reserved = {"admin", "api", "dashboard", "embed", "r", "auth", "login", "signup", "settings", "widgets"}
        if cleaned in reserved:
            raise ValueError(f"'{cleaned}' is a reserved keyword and cannot be used as an organization slug.")
        return cleaned


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    website_url: Optional[str] = None
    branding: Optional[Dict[str, Any]] = None


class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    website_url: Optional[str] = None
    branding: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class OrganizationWithRoleResponse(OrganizationResponse):
    role: str
