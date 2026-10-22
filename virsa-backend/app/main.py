from fastapi import FastAPI

from app.api.routes.auth import router as auth_router

app = FastAPI(
    title="VIRSA API",
    description="Backend for the VIRSA traditional crafts marketplace",
    version="0.1.0",
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to VIRSA API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}