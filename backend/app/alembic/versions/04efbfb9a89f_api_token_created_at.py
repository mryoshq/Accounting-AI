"""api_token_created_at

Revision ID: 04efbfb9a89f
Revises: 759cd70cc68f
Create Date: 2024-09-09 19:43:00.966262

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '04efbfb9a89f'
down_revision = '759cd70cc68f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('api_token_created_at', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'api_token_created_at')
    # ### end Alembic commands ###
