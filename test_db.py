import sys
from pathlib import Path

# Ensure virsa-backend is in sys.path when running from workspace root
backend_dir = Path(__file__).resolve().parent / "virsa-backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.db.session import engine

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version()"))
        print("Database connection successful!")
        print(result.scalar())
except Exception as error:
    print("Database connection failed:")
    print(error)
