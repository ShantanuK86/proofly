import pytest
import uuid
from httpx import AsyncClient
from app.models.entities import Testimonial


@pytest.mark.asyncio
async def test_testimonial_submission_and_moderation_lifecycle(client: AsyncClient, create_test_token):
    # 1. Setup Org
    user_id = uuid.uuid4()
    token = create_test_token(user_id=user_id, email="owner@agency.com", name="Agency Owner")
    org_res = await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Creative Agency", "slug": "creative-agency"},
    )
    assert org_res.status_code == 201

    # 2. Public customer submits feedback
    sub_res = await client.post(
        "/api/v1/public/collection-pages/creative-agency/testimonials",
        json={
            "customer_name": "Aarav Mehta",
            "customer_email": "aarav@example.com",
            "customer_role": "Founder, NovaPay",
            "rating": 5,
            "content": "The team delivered exactly what we needed on time and beyond expectations!",
            "publish_consent": True,
            "consent_version": "v1",
        },
    )
    assert sub_res.status_code == 201
    sub_data = sub_res.json()
    assert sub_data["status"] == "PENDING"
    testimonial_id = sub_data["id"]

    # 3. Owner views incoming reviews in dashboard
    list_res = await client.get(
        "/api/v1/testimonials?status=PENDING",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_res.status_code == 200
    testimonials = list_res.json()
    assert len(testimonials) == 1
    assert testimonials[0]["customer_name"] == "Aarav Mehta"
    assert testimonials[0]["customer_email"] == "aarav@example.com"  # Owner sees email in dashboard
    assert testimonials[0]["status"] == "PENDING"

    # 4. Owner approves the review
    approve_res = await client.patch(
        f"/api/v1/testimonials/{testimonial_id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "APPROVED"},
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 5. Check widgets list to get default widget public_id
    widgets_res = await client.get(
        "/api/v1/widgets",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert widgets_res.status_code == 200
    widget_public_id = widgets_res.json()[0]["public_id"]

    # 6. Verify public widget returns this approved review with NO customer email
    pub_res = await client.get(f"/api/v1/public/widgets/{widget_public_id}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert len(pub_data["testimonials"]) == 1
    item = pub_data["testimonials"][0]
    assert item["customer_name"] == "Aarav Mehta"
    assert item["rating"] == 5
    assert "customer_email" not in item  # PRIVACY: email never exposed!

    # 7. Owner rejects/unpublishes review
    reject_res = await client.patch(
        f"/api/v1/testimonials/{testimonial_id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "REJECTED"},
    )
    assert reject_res.status_code == 200

    # 8. Verify public widget now has 0 items
    pub_res_after = await client.get(f"/api/v1/public/widgets/{widget_public_id}")
    assert pub_res_after.status_code == 200
    assert len(pub_res_after.json()["testimonials"]) == 0


@pytest.mark.asyncio
async def test_invalid_rating_and_missing_consent(client: AsyncClient, create_test_token):
    # Setup Org
    token = create_test_token(user_id=uuid.uuid4(), email="host@example.com")
    await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Host Co", "slug": "host-co"},
    )

    # Invalid rating (6 stars)
    invalid_rating_res = await client.post(
        "/api/v1/public/collection-pages/host-co/testimonials",
        json={
            "customer_name": "Cheater",
            "rating": 6,
            "content": "Trying to break the rating validation",
            "publish_consent": True,
        },
    )
    assert invalid_rating_res.status_code == 422

    # Missing consent (False)
    no_consent_res = await client.post(
        "/api/v1/public/collection-pages/host-co/testimonials",
        json={
            "customer_name": "No Consent",
            "rating": 5,
            "content": "Great work but do not publish my quote",
            "publish_consent": False,
        },
    )
    assert no_consent_res.status_code == 422


@pytest.mark.asyncio
async def test_soft_delete_testimonial(client: AsyncClient, create_test_token):
    token = create_test_token(user_id=uuid.uuid4(), email="del@example.com")
    await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Delete Test Org", "slug": "delete-test-org"},
    )

    sub_res = await client.post(
        "/api/v1/public/collection-pages/delete-test-org/testimonials",
        json={
            "customer_name": "Soon Deleted",
            "rating": 5,
            "content": "This testimonial will be soft deleted by the owner.",
            "publish_consent": True,
        },
    )
    testi_id = sub_res.json()["id"]

    # Delete testimonial
    del_res = await client.delete(
        f"/api/v1/testimonials/{testi_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = await client.get(
        f"/api/v1/testimonials/{testi_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_res.status_code == 404

    # Does not appear in list
    list_res = await client.get(
        "/api/v1/testimonials",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert len(list_res.json()) == 0
