import pytest
import uuid
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_cross_tenant_isolation(client: AsyncClient, create_test_token):
    # Org A
    user_a = uuid.uuid4()
    token_a = create_test_token(user_id=user_a, email="user_a@alpha.com", name="Alpha Owner")
    res_a = await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"name": "Alpha Corp", "slug": "alpha-corp"},
    )
    org_a_id = res_a.json()["id"]

    # Org B
    user_b = uuid.uuid4()
    token_b = create_test_token(user_id=user_b, email="user_b@beta.com", name="Beta Owner")
    res_b = await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"name": "Beta Corp", "slug": "beta-corp"},
    )
    org_b_id = res_b.json()["id"]

    # Customer submits review to Org A
    sub_res = await client.post(
        "/api/v1/public/collection-pages/alpha-corp/testimonials",
        json={
            "customer_name": "Customer of Alpha",
            "rating": 5,
            "content": "Alpha is truly outstanding at everything they do!",
            "publish_consent": True,
        },
    )
    assert sub_res.status_code == 201
    testi_id_a = sub_res.json()["id"]

    # Customer submits review to Org B
    sub_res_b = await client.post(
        "/api/v1/public/collection-pages/beta-corp/testimonials",
        json={
            "customer_name": "Customer of Beta",
            "rating": 4,
            "content": "Beta was also good.",
            "publish_consent": True,
        },
    )
    assert sub_res_b.status_code == 201
    testi_id_b = sub_res_b.json()["id"]

    # User B tries to read Org A's review
    b_read_a = await client.get(
        f"/api/v1/testimonials/{testi_id_a}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert b_read_a.status_code == 404

    # User B tries to approve Org A's review
    b_patch_a = await client.patch(
        f"/api/v1/testimonials/{testi_id_a}/status",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"status": "APPROVED"},
    )
    assert b_patch_a.status_code == 404

    # User B tries to spoof X-Organization-Id to Org A's ID
    spoof_res = await client.get(
        f"/api/v1/testimonials/{testi_id_a}",
        headers={
            "Authorization": f"Bearer {token_b}",
            "X-Organization-Id": str(org_a_id),
        },
    )
    assert spoof_res.status_code == 403
    assert "not a member" in spoof_res.json()["detail"].lower()
