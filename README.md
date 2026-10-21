# TrailVerse

TrailVerse is a platform featuring a robust backend API (`virsa-backend`) for e-commerce, cultural heritage, and marketplace operations.

## 📖 Architectural Decision Records (ADRs)

All major coding, architectural, and design decisions in this project are tracked and documented in:
👉 **[DECISIONS.md](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/DECISIONS.md)**

Every contributor and AI agent must review and keep `DECISIONS.md` updated as new architectural patterns or dependencies are introduced.

---

## 🏗️ Repository Layout

- **[`virsa-backend/`](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/virsa-backend/)**: FastAPI backend service powering the API.
  - `app/api/`: Versioned API endpoints (`/auth`, `/users`, `/products`, `/cart`, `/orders`).
  - `app/core/`: Configuration, security, and JWT token management.
  - `app/db/`: Database session setup, connection pooling, and Base declarative model.
  - `app/models/`: SQLAlchemy ORM database models.
  - `app/schemas/`: Pydantic v2 validation DTOs.
  - `app/services/`: Service layer containing business and authentication logic.
  - `alembic/`: Database migrations.
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
