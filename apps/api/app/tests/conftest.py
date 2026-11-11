import os
import uuid
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

TEST_DB_PATH = "/tmp/test_proofly.db"
if os.path.exists(TEST_DB_PATH):
    os.remove(TEST_DB_PATH)

# Configure environment for tests
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEST_DB_PATH}"

from app.core.database import Base, get_db
from app.main import app
from app.core.security import create_access_token
from app.integrations.rate_limiter import reset_rate_limits

test_engine = create_async_engine(
    f"sqlite+aiosqlite:///{TEST_DB_PATH}",
    connect_args={"check_same_thread": False},
    future=True,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    reset_rate_limits()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        async with TestingSessionLocal() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def create_test_token():
    def _create(user_id: uuid.UUID, email: str = "test@example.com", name: str = "Test User"):
        return create_access_token(
            subject=f"auth_{user_id.hex[:10]}",
            user_id=str(user_id),
            email=email,
            name=name,
        )
    return _create
