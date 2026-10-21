from fastapi import FastAPI

app = FastAPI(
    title="VIRSA API",
    description="Backend for the VIRSA crafts marketplace",
    version="0.1.0",
)

@app.get("/")
def root():
    return {
        "message": "VIRSA API is running",
        "status": "ok",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}