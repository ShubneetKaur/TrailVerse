"""create uploaded assets

Revision ID: d4e5f6a7b8c9
Revises: 9c2d4e6f8a10
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "9c2d4e6f8a10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "uploaded_assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("public_id", sa.String(length=255), nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=False),
        sa.Column("artwork_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["artwork_id"], ["artworks.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["owner_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_id", name="uq_uploaded_assets_public_id"),
        sa.UniqueConstraint("artwork_id"),
    )
    op.create_index(
        "ix_uploaded_assets_owner_id",
        "uploaded_assets",
        ["owner_id"],
        unique=False,
    )
    op.create_index(
        "ix_uploaded_assets_artwork_id",
        "uploaded_assets",
        ["artwork_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_uploaded_assets_artwork_id", table_name="uploaded_assets")
    op.drop_index("ix_uploaded_assets_owner_id", table_name="uploaded_assets")
    op.drop_table("uploaded_assets")
