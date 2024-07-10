"""business models

Revision ID: 8a77825e64e3
Revises: e2412789c190
Create Date: 2024-05-17 15:44:50.619951

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '8a77825e64e3'
down_revision = 'e2412789c190'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('customer',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('project',
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('supplier',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('customercontact',
    sa.Column('contact_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('phone_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('address', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('bank_details', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['customer.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('externalinvoice',
    sa.Column('reference', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('invoice_date', sa.Date(), nullable=False),
    sa.Column('due_date', sa.Date(), nullable=False),
    sa.Column('amount_ttc', sa.Float(), nullable=False),
    sa.Column('amount_ht', sa.Float(), nullable=False),
    sa.Column('vat', sa.Float(), nullable=False),
    sa.Column('amount_in_currency', sa.Float(), nullable=False),
    sa.Column('currency_type', sa.Enum('MAD', 'EUR', name='currencytype'), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
    sa.ForeignKeyConstraint(['supplier_id'], ['supplier.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('internalinvoice',
    sa.Column('reference', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('invoice_date', sa.Date(), nullable=False),
    sa.Column('due_date', sa.Date(), nullable=False),
    sa.Column('amount_ttc', sa.Float(), nullable=False),
    sa.Column('amount_ht', sa.Float(), nullable=False),
    sa.Column('vat', sa.Float(), nullable=False),
    sa.Column('amount_in_currency', sa.Float(), nullable=False),
    sa.Column('currency_type', sa.Enum('MAD', 'EUR', name='currencytype'), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['customer.id'], ),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('suppliercontact',
    sa.Column('contact_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('phone_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('address', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('bank_details', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['supplier_id'], ['supplier.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('part',
    sa.Column('item_code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit_price', sa.Float(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=True),
    sa.Column('external_invoice_id', sa.Integer(), nullable=True),
    sa.Column('supplier_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['external_invoice_id'], ['externalinvoice.id'], ),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
    sa.ForeignKeyConstraint(['supplier_id'], ['supplier.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('paymentfromcustomer',
    sa.Column('payment_status', sa.Enum('Paid', 'Pending', 'Partial', 'Failed', 'Missing', name='paymentstatus'), nullable=False),
    sa.Column('payment_mode', sa.Enum('Cash', 'Bank_Transfer', 'Check', 'Credit', name='paymentmode'), nullable=False),
    sa.Column('amount_mad', sa.Float(), nullable=False),
    sa.Column('amount_euro', sa.Float(), nullable=True),
    sa.Column('remaining', sa.Float(), nullable=False),
    sa.Column('disbursement_date', sa.Date(), nullable=False),
    sa.Column('payment_ref', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('additional_fees', sa.Float(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('internal_invoice_id', sa.Integer(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['customer.id'], ),
    sa.ForeignKeyConstraint(['internal_invoice_id'], ['internalinvoice.id'], ),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('paymenttosupplier',
    sa.Column('payment_status', sa.Enum('Paid', 'Pending', 'Partial', 'Failed', 'Missing', name='paymentstatus'), nullable=False),
    sa.Column('payment_mode', sa.Enum('Cash', 'Bank_Transfer', 'Check', 'Credit', name='paymentmode'), nullable=False),
    sa.Column('amount_mad', sa.Float(), nullable=False),
    sa.Column('amount_euro', sa.Float(), nullable=True),
    sa.Column('remaining', sa.Float(), nullable=False),
    sa.Column('disbursement_date', sa.Date(), nullable=False),
    sa.Column('payment_ref', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('additional_fees', sa.Float(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('external_invoice_id', sa.Integer(), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['external_invoice_id'], ['externalinvoice.id'], ),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
    sa.ForeignKeyConstraint(['supplier_id'], ['supplier.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('paymenttosupplier')
    op.drop_table('paymentfromcustomer')
    op.drop_table('part')
    op.drop_table('suppliercontact')
    op.drop_table('internalinvoice')
    op.drop_table('externalinvoice')
    op.drop_table('customercontact')
    op.drop_table('supplier')
    op.drop_table('project')
    op.drop_table('customer')
    # ### end Alembic commands ###
