"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-11 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('auth_subject', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_auth_subject'), 'users', ['auth_subject'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)

    # Organizations
    op.create_table(
        'organizations',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('website_url', sa.Text(), nullable=True),
        sa.Column('branding', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_organizations_slug'), 'organizations', ['slug'], unique=True)

    # Organization Members
    op.create_table(
        'organization_members',
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('organization_id', 'user_id')
    )

    # Collection Pages
    op.create_table(
        'collection_pages',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('slug', sa.String(length=150), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('settings', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_collection_pages_organization_id'), 'collection_pages', ['organization_id'], unique=False)
    op.create_index(op.f('ix_collection_pages_slug'), 'collection_pages', ['slug'], unique=True)

    # Testimonials
    op.create_table(
        'testimonials',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('collection_page_id', sa.Uuid(), nullable=False),
        sa.Column('customer_name', sa.String(length=120), nullable=False),
        sa.Column('customer_email', sa.String(length=255), nullable=True),
        sa.Column('customer_role', sa.String(length=120), nullable=True),
        sa.Column('rating', sa.SmallInteger(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('publish_consent', sa.Boolean(), nullable=False),
        sa.Column('consent_version', sa.String(length=30), nullable=False),
        sa.Column('consent_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_by', sa.Uuid(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='ck_rating_range'),
        sa.ForeignKeyConstraint(['collection_page_id'], ['collection_pages.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_testimonials_org_status', 'testimonials', ['organization_id', 'status', 'submitted_at'], unique=False)
    op.create_index('idx_testimonials_public', 'testimonials', ['organization_id', 'status', 'publish_consent', 'deleted_at'], unique=False)
    op.create_index(op.f('ix_testimonials_deleted_at'), 'testimonials', ['deleted_at'], unique=False)
    op.create_index(op.f('ix_testimonials_organization_id'), 'testimonials', ['organization_id'], unique=False)
    op.create_index(op.f('ix_testimonials_status'), 'testimonials', ['status'], unique=False)
    op.create_index(op.f('ix_testimonials_submitted_at'), 'testimonials', ['submitted_at'], unique=False)

    # Widgets
    op.create_table(
        'widgets',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('public_id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('settings', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_widgets_organization_id'), 'widgets', ['organization_id'], unique=False)
    op.create_index(op.f('ix_widgets_public_id'), 'widgets', ['public_id'], unique=True)

    # Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('actor_id', sa.Uuid(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource_id', sa.String(length=100), nullable=False),
        sa.Column('details', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_organization_id'), 'audit_logs', ['organization_id'], unique=False)

    # Daily Stats
    op.create_table(
        'daily_stats',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('day', sa.Date(), nullable=False),
        sa.Column('submissions_count', sa.Integer(), nullable=False),
        sa.Column('widget_views_count', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_daily_stats_org_day', 'daily_stats', ['organization_id', 'day'], unique=True)


def downgrade() -> None:
    op.drop_table('daily_stats')
    op.drop_table('audit_logs')
    op.drop_table('widgets')
    op.drop_table('testimonials')
    op.drop_table('collection_pages')
    op.drop_table('organization_members')
    op.drop_table('organizations')
    op.drop_table('users')
