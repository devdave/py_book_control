"""Ensure scene status name is unique regardless of case

Revision ID: 716c3bb71e91
Revises: 49f75e0bca5d
Create Date: 2023-07-26 18:36:53.667407

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "716c3bb71e91"
down_revision = "49f75e0bca5d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("SceneStatus", schema=None) as batch_op:
        batch_op.drop_column("name")

    with op.batch_alter_table("SceneStatus", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("name", sa.String(255, collation="NOCASE")),
        )

    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("SceneStatus", schema=None) as batch_op:
        batch_op.create_unique_constraint("ux_book_name", ["book_id", "name"])

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("SceneStatus", schema=None) as batch_op:
        batch_op.drop_constraint("ux_book_name", type_="unique")

    # ### end Alembic commands ###
