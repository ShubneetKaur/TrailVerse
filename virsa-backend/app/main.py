
from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes import uploads
from app.api.routes.seller_applications import (
    router as seller_applications_router,
)
from app.api.routes.artworks import router as artworks_router

app = FastAPI(
    title="VIRSA API",
    description="Backend for the VIRSA traditional crafts marketplace",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(seller_applications_router)
app.include_router(artworks_router)
app.include_router(uploads.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to VIRSA API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
