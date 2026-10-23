"""add artwork stock and persistent carts

Revision ID: 7f4b1d2c9e10
Revises: 462263b11927
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7f4b1d2c9e10"
down_revision: Union[str, Sequence[str], None] = "462263b11927"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("artworks", recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column("stock_quantity", sa.Integer(), nullable=True),
        )
        batch_op.create_check_constraint(
            "ck_artworks_stock_nonnegative",
            "stock_quantity IS NULL OR stock_quantity >= 0",
        )
    op.create_table(
        "carts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_carts_user_id"),
    )
    op.create_index(op.f("ix_carts_id"), "carts", ["id"], unique=False)
    op.create_index(op.f("ix_carts_user_id"), "carts", ["user_id"], unique=False)
    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cart_id", sa.Integer(), nullable=False),
        sa.Column("artwork_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.CheckConstraint(
            "quantity >= 1",
            name="ck_cart_items_quantity_positive",
        ),
        sa.ForeignKeyConstraint(
            ["artwork_id"],
            ["artworks.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["cart_id"],
            ["carts.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "cart_id",
            "artwork_id",
            name="uq_cart_items_cart_artwork",
        ),
    )
    op.create_index(op.f("ix_cart_items_id"), "cart_items", ["id"], unique=False)
    op.create_index(
        op.f("ix_cart_items_cart_id"),
        "cart_items",
        ["cart_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_cart_items_artwork_id"),
        "cart_items",
        ["artwork_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_cart_items_artwork_id"), table_name="cart_items")
    op.drop_index(op.f("ix_cart_items_cart_id"), table_name="cart_items")
    op.drop_index(op.f("ix_cart_items_id"), table_name="cart_items")
    op.drop_table("cart_items")
    op.drop_index(op.f("ix_carts_user_id"), table_name="carts")
    op.drop_index(op.f("ix_carts_id"), table_name="carts")
    op.drop_table("carts")
    with op.batch_alter_table("artworks", recreate="always") as batch_op:
        batch_op.drop_constraint(
            "ck_artworks_stock_nonnegative",
            type_="check",
        )
        batch_op.drop_column("stock_quantity")
