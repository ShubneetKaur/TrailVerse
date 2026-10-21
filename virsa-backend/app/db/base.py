from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Model imports for Alembic discovery
from app.models.user import User  # noqa: F401, E402
from app.models.category import Category  # noqa: F401, E402
from app.models.product import Product  # noqa: F401, E402
from app.models.order import Order, OrderItem  # noqa: F401, E402
from app.models.review import Review  # noqa: F401, E402
