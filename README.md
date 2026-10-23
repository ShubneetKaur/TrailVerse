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
3. Create the local environment file:
   ```bash
   copy .env.example .env
   ```
   Keep `SECRET_KEY` private and replace the example value before using the backend outside local development.
4. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Access the interactive API documentation:
   - Swagger UI: `http://localhost:8000/api/v1/docs`
   - ReDoc: `http://localhost:8000/api/v1/redoc`

### Promote an existing local admin account

From the `virsa-backend` directory, opt in explicitly and pass the existing account email:

```powershell
$env:ALLOW_ADMIN_PROMOTION = "true"
$env:APP_ENV = "development"
..\.venv\Scripts\python.exe .\create_admin.py --email "admin@example.com"
```

The script never creates an account or changes its password. It refuses production-like environments and requires an existing user. After promotion, log in again to obtain a fresh access token before testing `GET /admin/dashboard/stats`.

### Reset an existing local development password

From the `virsa-backend` directory, opt in explicitly and pass the existing account email. The script prompts for the password without displaying it:

```powershell
$env:ALLOW_DEV_PASSWORD_RESET = "true"
$env:APP_ENV = "development"
..\.venv\Scripts\python.exe .\reset_dev_password.py --email "user@example.com"
```

The script uses the existing password-hashing utility, changes only the password hash, refuses production-like environments, and requires an existing user. It never prints or stores the password.

### Seller verification endpoints

- `POST /seller-applications`: Submit a seller application as a customer.
- `GET /seller-applications/mine`: View your own application history.
- `GET /seller-applications`: List applications as an admin.
- `GET /seller-applications/{application_id}`: View one application as an admin.
- `PATCH /seller-applications/{application_id}/review`: Approve, reject, or request more information as an admin.

Approval records verification status only; it does not change the user's role.

### PostgreSQL checkout concurrency tests

The PostgreSQL concurrency tests are opt-in and skipped by the normal test
suite unless `POSTGRES_TEST_DATABASE_URL` is set. They require a dedicated,
disposable PostgreSQL database; never point this variable at the development
database.

From `virsa-backend`, start the local test-only service without putting a
password in tracked files:

```powershell
$env:POSTGRES_TEST_PASSWORD = "<local-only-password>"
docker compose -f .\docker-compose.postgres-test.yml up -d --wait
$env:POSTGRES_TEST_DATABASE_URL = "postgresql+psycopg://trailverse_test:<local-only-password>@localhost:55432/trailverse_test"
$env:PYTHONPATH = "."
..\.venv\Scripts\python.exe -m pytest -q tests\test_orders_postgres.py
docker compose -f .\docker-compose.postgres-test.yml down -v
```

The integration fixture runs the Alembic migrations against the supplied
PostgreSQL URL, truncates only its test tables between cases, and downgrades
the disposable database during teardown. The normal SQLite suite does not
connect to this service.
