from typing import Dict, Any
from app.core.logging import logger


async def enqueue_submission_notification(
    organization_id: str,
    customer_name: str,
    rating: int,
    content_preview: str,
) -> None:
    """
    Safely enqueues notification about new testimonial submission.
    In production, triggers email to organization owner via Resend / SendGrid / Postmark.
    """
    logger.info(
        f"[Notification Outbox] New testimonial received for Org {organization_id}: "
        f"{customer_name} rated {rating}/5 stars. Preview: {content_preview[:40]}..."
    )
