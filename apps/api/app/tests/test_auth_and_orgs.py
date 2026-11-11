import pytest
import uuid
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_get_me(client: AsyncClient):
    # 1. Register new user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={"name": "Alice Founder", "email": "alice@brightstudio.com"},
    )
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@brightstudio.com"
    token = data["access_token"]

    # 2. Get current user
    me_res = await client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Alice Founder"


@pytest.mark.asyncio
async def test_create_organization_and_defaults(client: AsyncClient, create_test_token):
    user_id = uuid.uuid4()
    token = create_test_token(user_id=user_id, email="bob@creator.com", name="Bob")

    # Create Organization
    res = await client.post(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Bright Studio",
            "slug": "bright-studio",
            "website_url": "https://brightstudio.design",
        },
    )
    assert res.status_code == 201
    org_data = res.json()
    assert org_data["name"] == "Bright Studio"
    assert org_data["slug"] == "bright-studio"

    # Current org should resolve automatically
    curr_res = await client.get(
        "/api/v1/organizations/current",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert curr_res.status_code == 200
    assert curr_res.json()["role"] == "OWNER"

    # Default collection page should be auto-created
    pages_res = await client.get(
        "/api/v1/collection-pages",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pages_res.status_code == 200
    pages = pages_res.json()
    assert len(pages) == 1
    assert pages[0]["slug"] == "bright-studio"

    # Default widget should be auto-created
    widgets_res = await client.get(
        "/api/v1/widgets",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert widgets_res.status_code == 200
    widgets = widgets_res.json()
    assert len(widgets) == 1
    assert widgets[0]["type"] == "WALL"
    assert widgets[0]["public_id"].startswith("wdg_")
