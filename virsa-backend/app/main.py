import os
from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models  # noqa: F401
from app.db.session import Base, engine, get_db

load_dotenv()

# Ensure any declared tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "Virsa Backend API"),
    version="0.1.0",
)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Welcome to Virsa Backend API",
        "docs": "/docs",
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check validating application and database readiness."""
    db.execute(text("SELECT 1"))
    return {
        "status": "healthy",
        "database": "connected",
    }
