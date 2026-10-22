"""create seller applications

Revision ID: c31f7a9b8d2e
Revises: baa02e8aaa9e
Create Date: 2026-10-22 19:58:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c31f7a9b8d2e"
down_revision: Union[str, Sequence[str], None] = "baa02e8aaa9e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "seller_applications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("applicant_id", sa.Integer(), nullable=False),
        sa.Column("business_name", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column(
            "submitted_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'needs_more_info')",
            name="seller_application_status_check",
        ),
        sa.ForeignKeyConstraint(
            ["applicant_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["reviewed_by_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_seller_applications_id"),
        "seller_applications",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_seller_applications_applicant_id"),
        "seller_applications",
        ["applicant_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_seller_applications_status"),
        "seller_applications",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_seller_applications_status"),
        table_name="seller_applications",
    )
    op.drop_index(
        op.f("ix_seller_applications_applicant_id"),
        table_name="seller_applications",
    )
    op.drop_index(
        op.f("ix_seller_applications_id"),
        table_name="seller_applications",
    )
    op.drop_table("seller_applications")
