from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.core.logging import logger
from app.modules.auth.router import router as auth_router
from app.modules.organizations.router import router as org_router
from app.modules.collection_pages.router import router as col_pages_router
from app.modules.testimonials.router import router as testimonials_router
from app.modules.widgets.router import router as widgets_router
from app.modules.analytics.router import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Proofly API application...")
    if settings.ENVIRONMENT in ("development", "testing"):
        await init_db()
        logger.info("Database schema verified.")
    yield
    logger.info("Shutting down Proofly API application.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Micro-SaaS API for customer testimonial collection, moderation, and embeddable widgets.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "proofly-api",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Mount all modular routers using APIRouter under settings.API_V1_STR
api_v1_router = APIRouter(prefix=settings.API_V1_STR)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(org_router)
api_v1_router.include_router(col_pages_router)
api_v1_router.include_router(testimonials_router)
api_v1_router.include_router(widgets_router)
api_v1_router.include_router(analytics_router)

app.include_router(api_v1_router)
