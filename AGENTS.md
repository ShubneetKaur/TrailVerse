# TrailVerse Contributor & AI Agent Guidelines

## 📌 Architectural Decisions & Coding Standards

This project maintains an active **Architecture Decision Record (ADR)** file at [DECISIONS.md](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/DECISIONS.md).

### Mandatory Rules for Every Developer and AI Assistant:
1. **Consult Before Making Decisions:** Before introducing a new library, restructuring directories, changing database schemas, or modifying security/auth flows, consult [DECISIONS.md](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/DECISIONS.md).
2. **Document Major Coding Decisions:** Whenever you:
   - Add a new architectural pattern or service
   - Introduce or replace a major library/dependency
   - Modify database connection or migration workflows
   - Change authentication, authorization, or security rules
   - Introduce new concurrency, caching, or background processing mechanisms
   - Add client apps or frontend frameworks
   **You MUST record the decision in [DECISIONS.md](file:///c:/Users/Shubneet%20Kaur/Documents/trailverse/DECISIONS.md)** using the standard ADR template defined in that file.
3. **Preserve Decision History:** Do not delete past decisions; mark superseded decisions as `Superseded by ADR-XXX` and add the new record.

---

## 🛠️ Project Structure
- `virsa-backend/`: FastAPI backend service with SQLAlchemy 2.0, Pydantic v2, and Alembic.
- `DECISIONS.md`: Authoritative log of all major architectural and coding decisions.
