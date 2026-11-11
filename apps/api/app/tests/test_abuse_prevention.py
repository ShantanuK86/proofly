import pytest
import uuid
from httpx import AsyncClient
from app.integrations.rate_limiter import reset_rate_limits
from app.core.config import settings


@pytest.mark.asyncio
async def test_honeypot_bot_prevention(client: AsyncClient, create_test_token):
    token = create_test_token(user_id=uuid.uuid4(), email="honeypot@test.com")
    await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Honeypot Org", "slug": "honeypot-org"},
    )

    # Bot fills out the hidden `website_hp` field
    bot_res = await client.post(
        "/api/v1/public/collection-pages/honeypot-org/testimonials",
        json={
            "customer_name": "SpamBot 3000",
            "rating": 5,
            "content": "Buy cheap watches at malicious-link.example.com",
            "publish_consent": True,
            "website_hp": "http://spambot-link.com",  # Honeypot filled!
        },
    )
    # The API returns 201 dummy response without saving the spam to database
    assert bot_res.status_code == 201

    # Verify no testimonial actually stored in DB
    list_res = await client.get(
        "/api/v1/testimonials",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert len(list_res.json()) == 0


@pytest.mark.asyncio
async def test_inactive_collection_page_rejection(client: AsyncClient, create_test_token):
    token = create_test_token(user_id=uuid.uuid4(), email="inactive@test.com")
    await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Pause Reviews Co", "slug": "pause-reviews"},
    )

    pages = (await client.get("/api/v1/collection-pages", headers={"Authorization": f"Bearer {token}"})).json()
    page_id = pages[0]["id"]

    # Deactivate the collection page
    await client.patch(
        f"/api/v1/collection-pages/{page_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"is_active": False},
    )

    # Customer tries to submit
    sub_res = await client.post(
        "/api/v1/public/collection-pages/pause-reviews/testimonials",
        json={
            "customer_name": "Customer",
            "rating": 5,
            "content": "Trying to submit while page is inactive",
            "publish_consent": True,
        },
    )
    assert sub_res.status_code == 400
    assert "not accepting new submissions" in sub_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_rate_limiting_exceeded(client: AsyncClient, create_test_token):
    reset_rate_limits()
    token = create_test_token(user_id=uuid.uuid4(), email="ratelimit@test.com")
    await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Rate Limit Co", "slug": "rate-limit-co"},
    )

    # Submit up to the limit
    for i in range(settings.RATE_LIMIT_SUBMISSIONS_PER_IP_PER_HOUR):
        res = await client.post(
            "/api/v1/public/collection-pages/rate-limit-co/testimonials",
            json={
                "customer_name": f"Customer {i}",
                "rating": 5,
                "content": f"Legitimate review number {i} for testing rate limits.",
                "publish_consent": True,
            },
        )
        assert res.status_code == 201

    # Next submission exceeds limit
    exceeded_res = await client.post(
        "/api/v1/public/collection-pages/rate-limit-co/testimonials",
        json={
            "customer_name": "Spam Flooder",
            "rating": 5,
            "content": "This submission must be rate limited by the API.",
            "publish_consent": True,
        },
    )
    assert exceeded_res.status_code == 429
    assert "rate limit exceeded" in exceeded_res.json()["detail"].lower()
