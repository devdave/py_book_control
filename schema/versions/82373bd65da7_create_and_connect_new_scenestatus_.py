"""Create and connect new SceneStatus model/table

Revision ID: 82373bd65da7
Revises: a4e5f45f6d58
Create Date: 2023-07-21 10:32:05.069844

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "82373bd65da7"
down_revision = "a4e5f45f6d58"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "SceneStatus",
        sa.Column("uid", sa.String(), nullable=False),
        sa.Column("name", sa.String(255, collation="NOCASE"), nullable=False),
        sa.Column("book_id", sa.Integer(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "created_on",
            sa.DateTime(),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_on",
            sa.DateTime(),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["book_id"], ["Book.id"], name="FK_SceneStatus2Book"),
        sa.PrimaryKeyConstraint("id"),
    )

    with op.batch_alter_table("Scene", schema=None) as batch_op:
        batch_op.add_column(sa.Column("scene_status_id", sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("SceneStatus")

    with op.batch_alter_table("Scene", schema=None) as batch_op:
        batch_op.drop_column("scene_status_id")
    # ### end Alembic commands ###
