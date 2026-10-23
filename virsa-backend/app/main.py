
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.admin import router as admin_router
from app.api.routes.auth import router as auth_router
from app.api.routes import uploads
from app.api.routes.seller_applications import (
    router as seller_applications_router,
)
from app.api.routes.sellers import router as sellers_router
from app.api.routes.artworks import router as artworks_router
from app.api.routes.cart import router as cart_router
from app.api.routes.orders import router as orders_router

app = FastAPI(
    title="VIRSA API",
    description="Backend for the VIRSA traditional crafts marketplace",
    version="0.1.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(seller_applications_router, prefix=API_PREFIX)
app.include_router(sellers_router, prefix=API_PREFIX)
app.include_router(artworks_router, prefix=API_PREFIX)
app.include_router(uploads.router, prefix=API_PREFIX)
app.include_router(cart_router, prefix=API_PREFIX)
app.include_router(orders_router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {
        "message": "Welcome to VIRSA API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
