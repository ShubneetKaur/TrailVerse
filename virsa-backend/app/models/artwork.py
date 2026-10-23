
from datetime import datetime, timezone

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Artwork(Base):
    __tablename__ = "artworks"

    __table_args__ = (
        CheckConstraint(
            "price >= 0",
            name="ck_artworks_price_nonnegative",
        ),
        CheckConstraint(
            "status IN ('draft', 'published', 'archived')",
            name="ck_artworks_status",
        ),
        CheckConstraint(
            "stock_quantity IS NULL OR stock_quantity >= 0",
            name="ck_artworks_stock_nonnegative",
        ),
        Index("ix_artworks_seller_id", "seller_id"),
        Index("ix_artworks_category", "category"),
        Index("ix_artworks_state", "state"),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    price: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    stock_quantity: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    image_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )

    cloudinary_public_id: Mapped[str | None] = mapped_column(
    String(255),
    nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="draft",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    seller: Mapped["User"] = relationship(
        "User",
        foreign_keys=[seller_id],
    )
