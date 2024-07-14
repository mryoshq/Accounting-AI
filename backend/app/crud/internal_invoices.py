# app/crud/internal_invoices.py

from sqlmodel import Session, select, func
from typing import List, Optional, Any

from app.models import InternalInvoice, InternalInvoiceCreate, InternalInvoiceUpdate, Customer, Project

def create_internal_invoice_db(session: Session, internal_invoice_in: InternalInvoiceCreate) -> InternalInvoice:
    customer = session.get(Customer, internal_invoice_in.customer_id)
    if not customer:
        raise ValueError("Customer not found")

    project = session.get(Project, internal_invoice_in.project_id)
    if not project:
        raise ValueError("Project not found")

    vat = internal_invoice_in.amount_ttc - internal_invoice_in.amount_ht

    internal_invoice = InternalInvoice(
        reference=internal_invoice_in.reference,
        invoice_date=internal_invoice_in.invoice_date,
        due_date=internal_invoice_in.due_date,
        amount_ttc=internal_invoice_in.amount_ttc,
        amount_ht=internal_invoice_in.amount_ht,
        vat=vat,
        currency_type=internal_invoice_in.currency_type,
        customer_id=internal_invoice_in.customer_id,
        project_id=internal_invoice_in.project_id
    )

    session.add(internal_invoice)
    session.commit()
    session.refresh(internal_invoice)
    return internal_invoice

def get_internal_invoice_db(session: Session, internal_invoice_id: int) -> Optional[InternalInvoice]:
    return session.get(InternalInvoice, internal_invoice_id)

def get_internal_invoices_db(session: Session, skip: int = 0, limit: int = 100) -> List[InternalInvoice]:
    return session.exec(select(InternalInvoice).offset(skip).limit(limit)).all()

def get_internal_invoices_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(InternalInvoice)).one()

def update_internal_invoice_db(session: Session, internal_invoice: InternalInvoice, internal_invoice_in: InternalInvoiceUpdate) -> InternalInvoice:
    internal_invoice_data = internal_invoice_in.model_dump(exclude_unset=True)
    for key, value in internal_invoice_data.items():
        setattr(internal_invoice, key, value)
    session.add(internal_invoice)
    session.commit()
    session.refresh(internal_invoice)
    return internal_invoice

def delete_internal_invoice_db(session: Session, internal_invoice: InternalInvoice) -> InternalInvoice:
    session.delete(internal_invoice)
    session.commit()
    return internal_invoice

def get_internal_invoice_payments_db(session: Session, internal_invoice_id: int) -> List[Any]:
    internal_invoice = session.get(InternalInvoice, internal_invoice_id)
    return internal_invoice.payments_from_customers if internal_invoice else []