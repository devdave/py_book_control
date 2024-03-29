"""Add support for importing and or synchronizing from external sources

Revision ID: 79a9a942869a
Revises: 716c3bb71e91
Create Date: 2023-07-31 09:12:36.783344

"""
from alembic import op
import sqlalchemy as sa
from lib.sa_pathlike import SAPathlike

# revision identifiers, used by Alembic.
revision = "79a9a942869a"
down_revision = "716c3bb71e91"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("Book", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "operation_type",
                sa.Enum("managed", "oversight", "imported", name="booktypes"),
                nullable=False,
            )
        )
        batch_op.add_column(sa.Column("import_dir", SAPathlike(), nullable=False))

    with op.batch_alter_table("Chapter", schema=None) as batch_op:
        batch_op.add_column(sa.Column("source_file", SAPathlike(), nullable=True))
        batch_op.add_column(sa.Column("source_size", sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column("source_modified", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("last_imported", sa.DateTime(), nullable=True))

    with op.batch_alter_table("Scene", schema=None) as batch_op:
        batch_op.add_column(sa.Column("is_locked", sa.String(), nullable=False))

    with op.batch_alter_table("SceneStatus", schema=None) as batch_op:
        batch_op.alter_column(
            "name", existing_type=sa.VARCHAR(length=255), nullable=False
        )

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("SceneStatus", schema=None) as batch_op:
        batch_op.alter_column(
            "name", existing_type=sa.VARCHAR(length=255), nullable=True
        )

    with op.batch_alter_table("Scene", schema=None) as batch_op:
        batch_op.drop_column("is_locked")

    with op.batch_alter_table("Chapter", schema=None) as batch_op:
        batch_op.drop_column("last_imported")
        batch_op.drop_column("source_modified")
        batch_op.drop_column("source_size")
        batch_op.drop_column("source_file")

    with op.batch_alter_table("Book", schema=None) as batch_op:
        batch_op.drop_column("import_dir")
        batch_op.drop_column("operation_type")

    # ### end Alembic commands ###
