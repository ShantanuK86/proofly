import pytest
import uuid
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_widgets_and_analytics_flow(client: AsyncClient, create_test_token):
    # Setup
    token = create_test_token(user_id=uuid.uuid4(), email="analytics@widgets.com", name="Widget Pro")
    res = await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Widget Studio", "slug": "widget-studio"},
    )
    assert res.status_code == 201

    # Create Carousel widget
    w_create = await client.post(
        "/api/v1/widgets",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Homepage Carousel",
            "type": "CAROUSEL",
            "settings": {"theme": "dark", "accent_color": "#10B981"},
        },
    )
    assert w_create.status_code == 201
    carousel_public_id = w_create.json()["public_id"]
    carousel_id = w_create.json()["id"]

    # Submit a review
    await client.post(
        "/api/v1/public/collection-pages/widget-studio/testimonials",
        json={
            "customer_name": "Siddharth Verma",
            "customer_role": "CTO",
            "rating": 5,
            "content": "Proofly revolutionized how we collect customer feedback.",
            "publish_consent": True,
        },
    )

    # Approve the review
    all_reviews = (await client.get("/api/v1/testimonials", headers={"Authorization": f"Bearer {token}"})).json()
    review_id = all_reviews[0]["id"]
    await client.patch(
        f"/api/v1/testimonials/{review_id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "APPROVED"},
    )

    # Fetch public carousel widget twice to simulate impressions
    v1 = await client.get(f"/api/v1/public/widgets/{carousel_public_id}")
    assert v1.status_code == 200
    assert v1.json()["name"] == "Homepage Carousel"
    assert v1.json()["type"] == "CAROUSEL"
    assert len(v1.json()["testimonials"]) == 1

    v2 = await client.get(f"/api/v1/public/widgets/{carousel_public_id}")
    assert v2.status_code == 200

    # Check analytics overview
    analytics_res = await client.get(
        "/api/v1/analytics/overview",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert analytics_res.status_code == 200
    stats = analytics_res.json()
    assert stats["total_received"] == 1
    assert stats["total_published"] == 1
    assert stats["total_pending"] == 0
    assert stats["approval_rate_percent"] == 100.0
    assert stats["average_rating"] == 5.0
    assert stats["total_widget_views"] == 2
    assert stats["active_collection_slug"] == "widget-studio"

    # Disable widget and verify public 400
    await client.patch(
        f"/api/v1/widgets/{carousel_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"is_active": False},
    )
    v_disabled = await client.get(f"/api/v1/public/widgets/{carousel_public_id}")
    assert v_disabled.status_code == 400
    assert "disabled" in v_disabled.json()["detail"].lower()
