import uuid
from datetime import datetime, date, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import (
    String,
    Text,
    Boolean,
    SmallInteger,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    Index,
    CheckConstraint,
    JSON,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    auth_subject: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    memberships: Mapped[List["OrganizationMember"]] = relationship(
        "OrganizationMember", back_populates="user", cascade="all, delete-orphan"
    )


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    website_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    branding: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=lambda: {
            "primary_color": "#2563EB",
            "accent_color": "#3B82F6",
            "logo_url": None,
            "badge_text": "Verified by Proofly",
        },
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    members: Mapped[List["OrganizationMember"]] = relationship(
        "OrganizationMember", back_populates="organization", cascade="all, delete-orphan"
    )
    collection_pages: Mapped[List["CollectionPage"]] = relationship(
        "CollectionPage", back_populates="organization", cascade="all, delete-orphan"
    )
    testimonials: Mapped[List["Testimonial"]] = relationship(
        "Testimonial", back_populates="organization", cascade="all, delete-orphan"
    )
    widgets: Mapped[List["Widget"]] = relationship(
        "Widget", back_populates="organization", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog", back_populates="organization", cascade="all, delete-orphan"
    )
    daily_stats: Mapped[List["DailyStat"]] = relationship(
        "DailyStat", back_populates="organization", cascade="all, delete-orphan"
    )


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[str] = mapped_column(String(20), default="OWNER", nullable=False)  # OWNER, ADMIN, VIEWER
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="memberships")


class CollectionPage(Base):
    __tablename__ = "collection_pages"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    settings: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=lambda: {
            "questions": [
                "What problem did Proofly solve for your business?",
                "What specific result or benefit did you achieve?",
                "Would you recommend us to others?",
            ],
            "thank_you_message": "Thank you! Your testimonial has been submitted for review.",
            "submit_button_text": "Submit Review",
            "collect_role": True,
            "collect_email": True,
        },
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="collection_pages")
    testimonials: Mapped[List["Testimonial"]] = relationship(
        "Testimonial", back_populates="collection_page", cascade="all, delete-orphan"
    )


class Testimonial(Base):
    __tablename__ = "testimonials"
    __test__ = False

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    collection_page_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("collection_pages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    customer_name: Mapped[str] = mapped_column(String(120), nullable=False)
    customer_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # PRIVATE, NEVER IN PUBLIC API
    customer_role: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False, index=True)  # PENDING, APPROVED, REJECTED
    publish_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_version: Mapped[str] = mapped_column(String(30), default="v1", nullable=False)
    consent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_rating_range"),
        Index("idx_testimonials_org_status", "organization_id", "status", "submitted_at"),
        Index("idx_testimonials_public", "organization_id", "status", "publish_consent", "deleted_at"),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="testimonials")
    collection_page: Mapped["CollectionPage"] = relationship("CollectionPage", back_populates="testimonials")


class Widget(Base):
    __tablename__ = "widgets"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    public_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    type: Mapped[str] = mapped_column(String(20), default="WALL", nullable=False)  # WALL, CAROUSEL
    settings: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=lambda: {
            "theme": "light",  # light, dark, system
            "accent_color": "#2563EB",
            "show_rating": True,
            "show_role": True,
            "show_date": True,
            "card_shadow": True,
            "border_radius": "md",
            "columns": 3,
        },
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="widgets")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(100), nullable=False)
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="audit_logs")


class DailyStat(Base):
    __tablename__ = "daily_stats"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    day: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    submissions_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    widget_views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        Index("idx_daily_stats_org_day", "organization_id", "day", unique=True),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="daily_stats")
