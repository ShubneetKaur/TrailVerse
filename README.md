# TrailVerse

TrailVerse is a platform featuring a robust backend API (`virsa-backend`) for e-commerce, cultural heritage, and marketplace operations.

## 📖 Architectural Decision Records (ADRs)

All major coding, architectural, and design decisions in this project are tracked and documented in:
👉 **[DECISIONS.md](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/DECISIONS.md)**

Every contributor and AI agent must review and keep `DECISIONS.md` updated as new architectural patterns or dependencies are introduced.

---

## 🏗️ Repository Layout

- **[`virsa-backend/`](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/virsa-backend/)**: FastAPI backend service.
  - `app/main.py`: FastAPI app entrypoint with health and root endpoints.
  - `app/db/session.py`: Database engine, SessionLocal, and dependency setup.
  - `.env`: Local environment configurations.
  - `.gitignore`: Version control exclusions.
- **[`DECISIONS.md`](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/DECISIONS.md)**: Master decision log (ADR-001 through ADR-012+).
- **[`AGENTS.md`](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/AGENTS.md)**: AI agent and developer guidelines ensuring decisions remain documented.

---

## 🚀 Getting Started with the Backend

1. Navigate to the backend directory:
   ```bash
   cd virsa-backend
   ```
2. Activate your virtual environment and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
4. Access the interactive API documentation:
   - Swagger UI: `http://localhost:8000/api/v1/docs`
   - ReDoc: `http://localhost:8000/api/v1/redoc`
