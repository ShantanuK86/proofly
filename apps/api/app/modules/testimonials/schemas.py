import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict


class TestimonialSubmitRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=120)
    customer_email: Optional[EmailStr] = None
    customer_role: Optional[str] = Field(None, max_length=120)
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=10, max_length=2000)
    publish_consent: bool = Field(..., description="Must explicitly agree to public display")
    consent_version: str = Field("v1", max_length=30)
    website_hp: Optional[str] = Field(None, description="Honeypot field - must be empty")

    @field_validator("publish_consent")
    def validate_consent(cls, v):
        if not v:
            raise ValueError("You must provide consent for your review to be published.")
        return v


class TestimonialSubmitResponse(BaseModel):
    id: uuid.UUID
    status: str = "PENDING"
    message: str = "Thank you. Your testimonial was received."


class TestimonialStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(PENDING|APPROVED|REJECTED)$")


class TestimonialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    collection_page_id: uuid.UUID
    customer_name: str
    customer_email: Optional[str] = None
    customer_role: Optional[str] = None
    rating: int
    content: str
    status: str
    publish_consent: bool
    consent_version: str
    consent_at: datetime
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[uuid.UUID] = None


class PublicTestimonialItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_name: str
    customer_role: Optional[str] = None
    rating: int
    content: str
    submitted_at: datetime
