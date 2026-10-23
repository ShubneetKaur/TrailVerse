"""create orders and order items

Revision ID: 9c2d4e6f8a10
Revises: 7f4b1d2c9e10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9c2d4e6f8a10"
down_revision: Union[str, Sequence[str], None] = "7f4b1d2c9e10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status IN ('pending', 'cancelled')",
            name="ck_orders_status",
        ),
        sa.CheckConstraint(
            "currency = 'INR'",
            name="ck_orders_currency_inr",
        ),
        sa.CheckConstraint(
            "subtotal >= 0",
            name="ck_orders_subtotal_nonnegative",
        ),
        sa.CheckConstraint(
            "total >= 0",
            name="ck_orders_total_nonnegative",
        ),
        sa.ForeignKeyConstraint(
            ["customer_id"],
            ["users.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_id", "orders", ["id"], unique=False)
    op.create_index(
        "ix_orders_customer_id",
        "orders",
        ["customer_id"],
        unique=False,
    )
    op.create_index("ix_orders_status", "orders", ["status"], unique=False)
    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("artwork_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("listed_unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("agreed_unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("line_total", sa.Numeric(10, 2), nullable=False),
        sa.CheckConstraint(
            "listed_unit_price >= 0",
            name="ck_order_items_listed_price_nonnegative",
        ),
        sa.CheckConstraint(
            "agreed_unit_price >= 0",
            name="ck_order_items_agreed_price_nonnegative",
        ),
        sa.CheckConstraint(
            "quantity >= 1",
            name="ck_order_items_quantity_positive",
        ),
        sa.CheckConstraint(
            "line_total >= 0",
            name="ck_order_items_line_total_nonnegative",
        ),
        sa.ForeignKeyConstraint(
            ["order_id"],
            ["orders.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["artwork_id"],
            ["artworks.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_order_items_id", "order_items", ["id"], unique=False)
    op.create_index(
        "ix_order_items_order_id",
        "order_items",
        ["order_id"],
        unique=False,
    )
    op.create_index(
        "ix_order_items_artwork_id",
        "order_items",
        ["artwork_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_order_items_artwork_id", table_name="order_items")
    op.drop_index("ix_order_items_order_id", table_name="order_items")
    op.drop_index("ix_order_items_id", table_name="order_items")
    op.drop_table("order_items")
    op.drop_index("ix_orders_status", table_name="orders")
    op.drop_index("ix_orders_customer_id", table_name="orders")
    op.drop_index("ix_orders_id", table_name="orders")
    op.drop_table("orders")
