# Architecture Decision Records (ADR) & Major Coding Decisions

> **Project:** TrailVerse / Virsa  
> **Status:** Active & Maintained  
> **Rule for Contributors & AI Agents:** Whenever introducing an architectural pattern, choosing a major library, changing database structure, or modifying authentication/authorization semantics, you **must** log the decision in this document following the template below.

---

## 📑 Table of Contents

- [Maintenance Policy & Decision Template](#maintenance-policy--decision-template)
- [Summary of Decisions](#summary-of-decisions)
- [ADR-001: Workspace & Monorepo Structure](#adr-001-workspace--monorepo-structure)
- [ADR-002: Backend Framework Selection (FastAPI + Uvicorn)](#adr-002-backend-framework-selection-fastapi--uvicorn)
- [ADR-003: API Routing Hierarchy and Versioning Strategy](#adr-003-api-routing-hierarchy-and-versioning-strategy)
- [ADR-004: Data Validation, Serialization, and DTOs (Pydantic v2)](#adr-004-data-validation-serialization-and-dtos-pydantic-v2)
- [ADR-005: Database ORM and Connection Strategy (SQLAlchemy 2.0)](#adr-005-database-orm-and-connection-strategy-sqlalchemy-20)
- [ADR-006: Database Schema Migrations (Alembic)](#adr-006-database-schema-migrations-alembic)
- [ADR-007: Authentication & Token Architecture (JWT with Dual Login Endpoints)](#adr-007-authentication--token-architecture-jwt-with-dual-login-endpoints)
- [ADR-008: Password Security & Cryptography (Bcrypt via Passlib)](#adr-008-password-security--cryptography-bcrypt-via-passlib)
- [ADR-009: Layered Dependency Injection & Role-Based Access Control (RBAC)](#adr-009-layered-dependency-injection--role-based-access-control-rbac)
- [ADR-010: E-Commerce Relational Domain Modeling & Integrity Constraints](#adr-010-e-commerce-relational-domain-modeling--integrity-constraints)
- [ADR-011: Inventory Reservation & Checkout Concurrency Control](#adr-011-inventory-reservation--checkout-concurrency-control)
- [ADR-012: Configuration Management & 12-Factor Environment Settings](#adr-012-configuration-management--12-factor-environment-settings)
- [ADR-013: Streamlined Minimal Backend Architecture](#adr-013-streamlined-minimal-backend-architecture)
- [ADR-014: Modern Authentication Cryptography (pwdlib[argon2] & PyJWT)](#adr-014-modern-authentication-cryptography-pwdlibargon2--pyjwt)
- [ADR-016: Seller Verification Applications](#adr-016-seller-verification-applications)
- [ADR-017: Seller Role Promotion on Approval](#adr-017-seller-role-promotion-on-approval)
- [ADR-018: Explicit Vite Development CORS Origin](#adr-018-explicit-vite-development-cors-origin)
- [ADR-019: Persistent Customer Carts and Explicit Artwork Stock](#adr-019-persistent-customer-carts-and-explicit-artwork-stock)

---

## Maintenance Policy & Decision Template

### Policy
1. **Immutable History:** Once a decision is accepted and implemented, do not delete it. If the decision changes in the future, mark its status as `Superseded by ADR-XXX` and create a new record.
2. **Mandatory Documentation:** Every major new service, library, data layer modification, security change, or integration must be recorded here before or immediately after implementation.

### Decision Template
```markdown
### ADR-XXX: [Short Descriptive Title]

- **Date:** YYYY-MM-DD
- **Status:** [Proposed | Accepted | Implemented | Deprecated | Superseded by ADR-YYY]
- **Components:** [e.g., Backend, Auth, Database, API, Frontend]

#### Context
What problem was being addressed? What constraints or considerations were present?

#### Decision
What choice was made? What technologies, patterns, or architecture were adopted?

#### Consequences & Rationale
- **Benefits:** Why this is good.
- **Trade-offs / Risks:** What we sacrifice or must monitor.
- **Alternatives Considered:** What options were rejected and why.
```

---

## Summary of Decisions

| ID | Title | Status | Primary Component |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Workspace & Monorepo Structure | `Implemented` | Project Architecture |
| **ADR-002** | Backend Framework Selection (FastAPI + Uvicorn) | `Implemented` | Backend Framework |
| **ADR-003** | API Routing Hierarchy & Versioning (`/api/v1`) | `Implemented` | API Design |
| **ADR-004** | Data Validation, Serialization, and DTOs (Pydantic v2) | `Implemented` | Data Validation |
| **ADR-005** | Database ORM & Session Lifecycle (SQLAlchemy 2.0) | `Implemented` | Persistence Layer |
| **ADR-006** | Database Schema Migrations (Alembic) | `Implemented` | Database Tooling |
| **ADR-007** | JWT Authentication with Dual Login Endpoints | `Implemented` | Authentication & Security |
| **ADR-008** | Password Hashing (Bcrypt via Passlib) | `Implemented` | Security / Crypto |
| **ADR-009** | Layered Dependency Injection & RBAC | `Implemented` | Authorization & Architecture |
| **ADR-010** | Relational Domain Modeling & Referential Integrity | `Implemented` | Data Modeling |
| **ADR-011** | Inventory Reservation & Checkout Concurrency (`with_for_update`) | `Implemented` | Business Logic / Transactions |
| **ADR-012** | 12-Factor Environment Settings (`pydantic-settings`) | `Implemented` | Configuration & DevOps |
| **ADR-013** | Streamlined Minimal Backend Architecture | `Implemented` | Project Architecture |
| **ADR-014** | Modern Authentication Cryptography (`pwdlib[argon2]` & `PyJWT`) | `Implemented` | Security / Crypto & Auth |
| **ADR-015** | Reusable Role-Based Access Dependency | `Implemented` | Authorization & API |
| **ADR-016** | Seller Verification Applications | `Implemented` | Seller Verification & Database |
| **ADR-017** | Seller Role Promotion on Approval | `Implemented` | Seller Verification & Authorization |
| **ADR-018** | Explicit Vite Development CORS Origin | `Implemented` | API & Security |
| **ADR-019** | Persistent Customer Carts and Explicit Artwork Stock | `Implemented` | Marketplace / Database |

---

## ADR-001: Workspace & Monorepo Structure

- **Status:** `Implemented`
- **Components:** Project Architecture

### Context
TrailVerse is an evolving platform featuring a backend core (`virsa-backend`) that serves e-commerce, cultural heritage, or marketplace capabilities, with anticipated additions for web/mobile frontends. We needed a clean directory structure that keeps the codebase unified without creating tight coupling between the backend and future client apps.

### Decision
Adopt a modular monorepo directory layout at workspace root:
- `virsa-backend/`: Self-contained Python application containing its own virtual environment configurations, dependency manifests (`requirements.txt`), migrations (`alembic/`), and application logic (`app/`).
- Root level contains shared repository governance (`README.md`, `DECISIONS.md`, `.gitignore`, and agent customization rules).
- Client applications (e.g. web frontend, admin dashboard) will reside in sibling directories alongside `virsa-backend/`.

### Consequences & Rationale
- **Benefits:** Simplifies version control, coordinates documentation, and enables cross-project workflows while keeping backend deployment isolated.
- **Trade-offs:** Requires running backend commands from `virsa-backend` or referencing subpaths.

---

## ADR-002: Backend Framework Selection (FastAPI + Uvicorn)

- **Status:** `Implemented`
- **Components:** Backend Framework

### Context
The backend requires high-throughput asynchronous execution, native OpenAPI/Swagger documentation, strict type validation, and rapid API endpoint development.

### Decision
Selected **FastAPI** (`fastapi>=0.110.0`) running on the **Uvicorn** ASGI server (`uvicorn[standard]>=0.28.0`).

### Consequences & Rationale
- **Benefits:**
  - Standardized OpenAPI 3.0 schemas automatically exposed at `/api/v1/docs` (Swagger UI) and `/api/v1/redoc` (ReDoc).
  - Modern Python type hints throughout request handlers and database transactions.
  - Native asynchronous support and dependency injection system.
- **Trade-offs:** Requires standard ASGI deployment setup rather than traditional WSGI (like Gunicorn + WSGI).

---

## ADR-003: API Routing Hierarchy and Versioning Strategy

- **Status:** `Implemented`
- **Components:** API Design & Routing

### Context
Client applications require stable endpoints that can evolve without breaking backwards compatibility. The API also needs health monitoring for container orchestrators and load balancers.

### Decision
1. **Global Version Prefix:** All API endpoints are namespaced under `/api/v1` (`settings.API_V1_STR`), aggregated through a central `api_router` in `app/api/routes/__init__.py`.
2. **Modular Sub-Routers:** Dedicated route files by domain:
   - `/auth`: Registration, OAuth2 login, JSON login, current profile (`/me`).
   - `/users`: User administration and profile updates.
   - `/products`: Product listing, filtering, search, and category management.
   - `/cart`: Dynamic cart availability check and price calculation.
   - `/orders`: Order placement, user order history, and detailed order retrieval.
3. **Health Check Endpoints:**
   - `GET /`: Root informational status including project name, status string, and interactive docs URL.
   - `GET /health`: Lightweight heartbeat endpoint (`{"status": "healthy"}`) for probes and load balancers.

### Consequences & Rationale
- **Benefits:** Clear route ownership, predictable URL taxonomy, zero conflicts across domains, and readiness for future `/api/v2` versioning if breaking changes are introduced.

---

## ADR-004: Data Validation, Serialization, and DTOs (Pydantic v2)

- **Status:** `Implemented`
- **Components:** Data Validation & DTO Layer

### Context
APIs must strictly validate incoming request payloads to prevent malformed data or security vulnerabilities (e.g., mass-assignment or injection), while preventing leakage of sensitive internal columns (e.g., `hashed_password`).

### Decision
Utilize **Pydantic v2** (`pydantic>=2.6.0`) with a layered Data Transfer Object (DTO) schema pattern in `app/schemas/`:
1. **Base Schema (`*Base`):** Defines shared fields and field constraints (e.g., `UserBase`, `ProductBase`, `CategoryBase`).
2. **Create Schema (`*Create`):** Adds fields required only at creation time (e.g., plain-text `password` in `UserCreate`).
3. **Update Schema (`*Update`):** All fields optional to support partial updates (`PATCH`/`PUT`).
4. **Response Schema (`*Response`):** Explicitly specifies which fields are serialized to clients. Configured with `model_config = ConfigDict(from_attributes=True)` to map directly from SQLAlchemy ORM entities. Sensitive fields like `hashed_password` are strictly omitted.

### Consequences & Rationale
- **Benefits:** Compile-time and runtime type safety, automatic 422 Unprocessable Entity responses for invalid inputs, and protection against accidental disclosure of credentials.

---

## ADR-005: Database ORM and Connection Strategy (SQLAlchemy 2.0)

- **Status:** `Implemented`
- **Components:** Persistence Layer

### Context
We need a robust ORM that allows local rapid prototyping (zero-configuration SQLite) while providing seamless portability to production-grade relational databases like PostgreSQL.

### Decision
1. **SQLAlchemy 2.0:** Standardized on `sqlalchemy>=2.0.28` using `declarative_base()` (`app.db.base.Base`).
2. **Session Lifecycle via Dependency Injection:** A FastAPI generator dependency `get_db()` in `app/dependencies.py` instantiates `SessionLocal()`, yields the active session to the route handler, and reliably calls `db.close()` in a `finally` block.
3. **Connection Pooling & Multi-Dialect Setup:**
   - `pool_pre_ping=True` ensures stale or dropped connections are reconnected before query execution.
   - Conditional `{"check_same_thread": False}` enabled automatically when running against SQLite.
   - Production can switch directly to PostgreSQL simply by configuring `DATABASE_URL=postgresql://user:pass@host/db` without altering Python code.

### Consequences & Rationale
- **Benefits:** Prevents connection leaks, provides complete database decoupling, and isolates transaction boundaries cleanly per HTTP request.

---

## ADR-006: Database Schema Migrations (Alembic)

- **Status:** `Implemented`
- **Components:** Database Tooling

### Context
Manual schema updates lead to drift across environments and loss of historical structural tracking. We need repeatable, code-controlled migrations.

### Decision
Adopt **Alembic** (`alembic>=1.13.1`):
1. Configuration in `virsa-backend/alembic.ini` and environment script `virsa-backend/alembic/env.py`.
2. Dynamic connection URL resolution: `alembic/env.py` reads `settings.DATABASE_URL` directly from application settings.
3. Centralized Model Aggregation: `app/db/base.py` imports all ORM models (`User`, `Category`, `Product`, `Order`, `OrderItem`, `Review`) and binds their metadata to `target_metadata = Base.metadata`. This guarantees `alembic revision --autogenerate` detects every table and relation.

### Consequences & Rationale
- **Benefits:** Zero manual SQL file tracking needed; all schema changes are versioned alongside source code and can be verified across staging and production.

---

## ADR-007: Authentication & Token Architecture (JWT with Dual Login Endpoints)

- **Status:** `Implemented`
- **Components:** Authentication & Security

### Context
Client applications (React/Next.js/mobile) typically interact via standard JSON REST bodies (`{"email": "...", "password": "..."}`). However, OpenAPI/Swagger UI relies on the OAuth2 specification (`OAuth2PasswordRequestForm` with `application/x-www-form-urlencoded` fields `username` and `password`) to drive the interactive "Authorize" lock button.

### Decision
Implement stateless **JWT (JSON Web Tokens)** using `python-jose` with dual authentication endpoints in `app/api/routes/auth.py`:
1. `POST /api/v1/auth/login`: Accepts `OAuth2PasswordRequestForm` to provide full compatibility with Swagger UI.
2. `POST /api/v1/auth/login/json`: Accepts `LoginRequest` (JSON body) for seamless SPA, mobile, and third-party API clients.
3. Tokens are signed using HMAC-SHA256 (`HS256`) containing the subject `sub` (user's email) and expiration timestamp `exp`.
4. Lifetime configured via `ACCESS_TOKEN_EXPIRE_MINUTES` (default 60 minutes).

### Consequences & Rationale
- **Benefits:** Best of both worlds: full Swagger UI interactivity during development/testing, and native JSON payloads for frontend clients without requiring form-data encoders.

---

## ADR-008: Password Security & Cryptography (Bcrypt via Passlib)

- **Status:** `Implemented`
- **Components:** Security / Cryptography

### Context
Passwords must never be stored in plaintext. They require slow, salted, computationally intensive hashing algorithms resistant to GPU acceleration and precomputed rainbow table attacks.

### Decision
Standardize on **Bcrypt** via `passlib[bcrypt]` and `bcrypt>=4.0.1`:
- Encapsulated in `app/core/security.py` via `CryptContext(schemes=["bcrypt"], deprecated="auto")`.
- `verify_password(plain_password, hashed_password) -> bool`
- `get_password_hash(password) -> str`
- Hashes are verified and generated exclusively in the service layer (`app/services/auth_service.py`).

### Consequences & Rationale
- **Benefits:** Industry-standard password hashing with automatic salt generation and work-factor calibration.

---

## ADR-009: Layered Dependency Injection & Role-Based Access Control (RBAC)

- **Status:** `Implemented`
- **Components:** Authorization & Middleware

### Context
Different endpoints require varying security guarantees: public access, authenticated user access, active user status, or administrator (superuser) access. Duplicating authorization logic in route bodies creates bugs and security regressions.

### Decision
Implement a layered dependency chain in `app/dependencies.py`:
```
                  ┌──────────────────────┐
                  │       get_db         │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │   get_current_user   │  (validates JWT bearer token)
                  └──────────┬───────────┘
                             │
               ┌─────────────▼──────────────┐
               │  get_current_active_user   │  (ensures user.is_active == True)
               └─────────────┬──────────────┘
                             │
             ┌───────────────▼───────────────┐
             │ get_current_active_superuser  │  (ensures user.is_superuser == True)
             └───────────────────────────────┘
```
- Non-authenticated requests receive `401 Unauthorized` with `WWW-Authenticate: Bearer`.
- Inactive accounts receive `400 Bad Request`.
- Regular users attempting admin actions (e.g. creating products or reading user directories) receive `403 Forbidden`.

### Consequences & Rationale
- **Benefits:** Extremely clean route signatures (e.g., `current_user: User = Depends(get_current_active_superuser)`), zero code repetition, and deterministic enforcement of least-privilege principles.

---

## ADR-010: E-Commerce Relational Domain Modeling & Integrity Constraints

- **Status:** `Implemented`
- **Components:** Domain Models / Database

### Context
The e-commerce data model consists of `User`, `Category`, `Product`, `Order`, `OrderItem`, and `Review`. Relationships require careful foreign key cascade actions to prevent dangling records and protect historical financial transactions.

### Decision
1. **Foreign Key Deletion Rules:**
   - `Order.user_id`: `CASCADE` with User.
   - `OrderItem.order_id`: `CASCADE` with Order.
   - `OrderItem.product_id`: `RESTRICT`. Deleting a product must not erase or corrupt historical order records or receipts.
   - `Product.category_id`: `SET NULL`. Deleting a category keeps associated products active without a assigned category.
   - `Review.user_id` & `Review.product_id`: `CASCADE`.
2. **Historical Pricing Preservation:** `OrderItem` captures a standalone `price: Float` column at the moment of order placement, decoupling historical records from subsequent product price changes.
3. **Database-Level Data Integrity Constraints:**
   - Unique constraints on `User.email`, `Category.name`, and `Category.slug`.
   - `CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range")` enforced directly in the database for `Review`.

### Consequences & Rationale
- **Benefits:** Eliminates orphaned items, preserves financial audit history, and enforces valid ratings at both database and schema layers.

---

## ADR-011: Inventory Reservation & Checkout Concurrency Control

- **Status:** `Implemented`
- **Components:** Orders & Inventory / Concurrency

### Context
In concurrent e-commerce systems, multiple customers may simultaneously order the last remaining units of stock. Without synchronization, race conditions allow overselling below zero.

### Decision
1. **Pessimistic Locking on Checkout:** In `POST /api/v1/orders` (`app/api/routes/orders.py`), product stock verification uses `db.query(Product)...with_for_update()`.
2. **Atomic Inventory Decrement:** In the same database transaction, available stock is decremented (`product.stock -= item.quantity`), line items are generated, the order is created, and the transaction is committed atomically. If any item is out of stock, the transaction aborts with `400 Bad Request`.
3. **Read-Only Cart Estimation:** `POST /api/v1/cart/calculate` performs live product and stock validation without acquiring row locks, ensuring high read throughput prior to the actual checkout step.

### Consequences & Rationale
- **Benefits:** Prevents race conditions and inventory deficits during sales spikes while keeping browsing and cart viewing performant.

---

## ADR-012: Configuration Management & 12-Factor Environment Settings

- **Status:** `Implemented`
- **Components:** Configuration & Environment

### Context
Configuration values (JWT secrets, token expiry, database connection strings, CORS origins) vary across local development, testing, staging, and production. Hardcoding configurations or secrets in repository code violates Twelve-Factor App principles and introduces security risks.

### Decision
Adopt **`pydantic-settings`** with `BaseSettings` in `app/core/config.py`:
- Configuration attributes define sane development defaults with environment variable overrides loaded from `.env`.
- CORS configuration accepts a typed `list[str]` of allowed client origins.
- Sensitive values like `SECRET_KEY` are isolated, with `.env` ignored by git and template values documented in `.env.example`.

### Consequences & Rationale
- **Benefits:** Zero-code deployments across environments, strict validation of configuration types at boot, and complete isolation of credentials.

---

## ADR-013: Streamlined Minimal Backend Architecture

- **Date:** 2026-10-21
- **Status:** `Implemented` (Supersedes ADR-003, ADR-006, ADR-007, ADR-008, ADR-009, ADR-010, ADR-011 for minimal baseline)
- **Components:** Backend Core, Database, Project Architecture

### Context
To facilitate rapid incremental prototyping and minimize operational complexity at the early development stage, the backend structure needed to be streamlined down to its essential core: direct database connectivity and a centralized application entrypoint.

### Decision
Consolidate `virsa-backend/` to a lightweight, minimalist baseline layout:
```
virsa-backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── db/
│       ├── __init__.py
│       └── session.py
├── .env
└── .gitignore
```
1. **Application Entrypoint (`app/main.py`):** Instantiates FastAPI, loads environment settings via `dotenv`, sets up root info and `/health` probes with live database ping verification.
2. **Database Engine & Session (`app/db/session.py`):** Configures SQLAlchemy declarative base, thread-safe connection pool, `SessionLocal`, and FastAPI dependency `get_db`.
3. **Environment Configuration (`.env`):** Defines minimal variables (`PROJECT_NAME`, `DATABASE_URL`).
4. **Git Ignore (`.gitignore`):** Ignores virtual environments, secrets, databases, and Python caches.

### Consequences & Rationale
- **Benefits:** Low barrier to entry, minimal boilerplate, and immediate readiness for targeted feature additions.
- **Trade-offs:** Advanced features like migrations (Alembic), JWT authentication routes, and multi-resource schemas will be reintroduced incrementally as each domain area is developed.

---

## ADR-014: Modern Authentication Cryptography (pwdlib[argon2] & PyJWT)

- **Date:** 2026-10-21
- **Status:** `Implemented` (Supersedes ADR-007 and ADR-008 crypto tooling)
- **Components:** Security / Crypto & Authentication

### Context
`passlib` has ceased active maintenance and triggers deprecation warnings on modern Python/cryptography releases. Similarly, `python-jose` lacks active maintenance for newer cryptographic primitives. Modern FastAPI production best practices recommend switching to `pwdlib` with Argon2id support for password hashing and `PyJWT` for robust token signing and validation.

### Decision
Adopt modern, actively maintained cryptographic tooling:
1. **Password Hashing:** `pwdlib[argon2]>=0.2.0` utilizing Argon2id as the default password hasher (the winner of the Password Hashing Competition, memory-hard and GPU-resistant).
2. **Token Signing & Verification:** `pyjwt[crypto]>=2.8.0` for HMAC-SHA256 and asymmetric JWT operations.
3. **Email Validation:** `email-validator>=2.1.0` for strict RFC 5322 email syntax and DNS checks in Pydantic schemas.

### Consequences & Rationale
- **Benefits:** Eliminates legacy deprecation warnings, provides superior protection against hardware brute-force attacks via Argon2id, and aligns with standard modern FastAPI security architecture.
- **Trade-offs:** Slightly higher CPU/memory consumption per hash verification during login, which is tunable via Argon2 time and memory cost parameters.

---

## ADR-015: Reusable Role-Based Access Dependency

- **Date:** 2026-10-22
- **Status:** `Implemented`
- **Components:** Authorization & API

### Context
The current authentication flow validates a bearer token and resolves an active `User`, but protected endpoints also need a consistent way to enforce role requirements. Missing or invalid authentication must remain distinct from authenticated users who lack permission.

### Decision
Implement `require_role(*allowed_roles)` in `app/dependencies.py` as a dependency factory layered on `get_current_user`:
- Missing or invalid bearer credentials return HTTP 401.
- An authenticated user whose role is not allowed returns HTTP 403.
- Public registration does not accept a role field and always creates users with the approved `customer` role.
- Seller application workflows and role-changing database migrations are out of scope for this foundation.

### Consequences & Rationale
- **Benefits:** Centralizes role checks, keeps route handlers concise, and preserves least-privilege behavior across future protected endpoints.
- **Trade-offs / Risks:** Role values remain string-based until a future schema decision establishes the seller/admin role lifecycle and any required migration.

---

## ADR-016: Seller Verification Applications

- **Date:** 2026-10-22
- **Status:** `Superseded by ADR-017`
- **Components:** Seller Verification, Authorization & Database

### Context
Customers need to request seller access without being able to grant themselves a privileged role. Administrators need an auditable workflow to review applications, while approval status must remain distinct from the existing user role until a future decision defines seller onboarding.

### Decision
Add a `seller_applications` table and API workflow:
- Applications belong to a customer and use `pending`, `approved`, `rejected`, or `needs_more_info` statuses.
- Applications store business name, description, submission time, review time, reviewer ID, and review notes.
- Customers can submit applications and view only their own applications.
- Administrators can list, inspect, and review applications.
- Rejection and requests for more information require review notes.
- Approval does not change `users.role`; this was later superseded by ADR-017.

### Consequences & Rationale
- **Benefits:** Provides a minimal auditable verification workflow with least-privilege authorization and clear separation between verification state and user authorization.
- **Trade-offs / Risks:** Seller role promotion, document uploads, application updates after a request for more information, and marketplace capabilities require future decisions and implementation.

---

## ADR-017: Seller Role Promotion on Approval

- **Date:** 2026-10-22
- **Status:** `Implemented`
- **Components:** Seller Verification & Authorization

### Context
The seller profile endpoint and seller-only capabilities use the `seller` role, while seller applications are reviewed by administrators. Approved applicants therefore need a controlled transition from the default `customer` role to `seller`.

### Decision
When an administrator approves a seller application, the review workflow sets the associated user's role to `seller` in the same database transaction as the application review metadata. Rejected and `needs_more_info` decisions do not promote the user.

### Consequences & Rationale
- **Benefits:** Approved users can access seller profile and seller-only functionality without relying on request-body role fields or privileged self-assignment.
- **Trade-offs / Risks:** A future role-revocation or seller suspension workflow must define how the user's role and application history are reconciled.

---

## ADR-018: Explicit Vite Development CORS Origin

- **Date:** 2026-10-23
- **Status:** `Implemented`
- **Components:** API & Security

### Context
The browser-based Vite frontend runs on its default development origin, `http://localhost:5173`, which is cross-origin from the backend. Without an explicit backend policy, browser requests and preflight requests from the frontend cannot access the API.

### Decision
Configure FastAPI's `CORSMiddleware` to allow only `http://localhost:5173`, the API methods currently used by the backend (`GET`, `POST`, `PATCH`, and `DELETE`), and the `Authorization` and `Content-Type` request headers. Do not enable credentialed cookie requests.

### Consequences & Rationale
- **Benefits:** Enables the local Vite frontend to call the API while restricting browser access to a single known development origin and the API's required methods and headers.
- **Trade-offs / Risks:** Other frontend origins, including alternate hostnames or ports and production origins, must be explicitly configured when introduced.
- **Alternatives Considered:** Allowing every origin was rejected because it is unnecessarily broad; configuring production origins is deferred until a production frontend origin is known.

---

## ADR-019: Persistent Customer Carts and Explicit Artwork Stock

- **Date:** 2026-10-23
- **Status:** `Implemented`
- **Components:** Marketplace / Database / API

### Context
The marketplace needs a persistent cart before checkout can be implemented. Existing artworks had prices and publication status but no inventory quantity, so checkout could not later prevent overselling.

### Decision
Add one persistent cart per customer and cart items with a database uniqueness constraint on `(cart_id, artwork_id)`. Cart totals are calculated from the current database artwork price; clients cannot provide prices or totals. Add nullable `stock_quantity` to artworks: legacy rows with `NULL` inventory are not available to carts, while new or updated rows may specify a non-negative integer quantity. Cart additions and quantity updates require a published artwork with positive stock.

### Consequences & Rationale
- **Benefits:** Cart ownership and duplicate lines are enforced at both the API and database layers, and checkout has an explicit stock value to validate and decrement later.
- **Trade-offs / Risks:** Existing artworks require an explicit stock update before they can be purchased. Checkout must still implement an atomic decrement and reservation policy.
- **Alternatives Considered:** Backfilling existing artwork quantities was rejected because it would invent inventory values and silently change existing availability.

---

### ADR-020: Atomic Customer Orders and Inventory Checkout

- **Date:** 2026-10-23
- **Status:** `Implemented`
- **Components:** Orders, Marketplace, Database, API

#### Context
Phase 1 carts do not reserve stock. Checkout therefore needs to create one order from the authenticated customer's entire cart while preventing overselling and preserving historical prices.

#### Decision
Add customer-owned `orders` and immutable `order_items`. Checkout uses the current listed artwork price as both `listed_unit_price` and, absent a future server-authorized negotiation agreement, `agreed_unit_price`. It decrements each artwork through a conditional stock update in deterministic artwork-ID order, creates all order snapshots, clears the cart, and commits only after every item succeeds. Any failure rolls back the complete transaction.

Orders use `pending` and `cancelled` statuses, store `INR`, and may be cancelled only while pending. Cancellation uses a conditional status transition and restores each item's stock in the same transaction, so repeated cancellation cannot restore inventory twice. Customer and artwork foreign keys restrict deletion to preserve order history.

#### Consequences & Rationale
- **Benefits:** Prevents overselling at the database write boundary, preserves listed/agreed price history, and keeps cancellation inventory restoration atomic.
- **Trade-offs / Risks:** Payment, expiry, refunds, shipping, negotiation, and PostgreSQL concurrency validation remain outside this phase. Pending orders consume stock until cancellation.
- **Alternatives Considered:** Relying only on pre-checkout reads or `SELECT ... FOR UPDATE` was rejected because carts are not reservations and SQLite does not provide row-level locking.

---

*This document must be updated whenever any major architectural decision or new technical component is introduced to TrailVerse.*
