# app/crud/external_invoices.py

from sqlmodel import Session, select, func
from typing import List, Optional

from app.models import ExternalInvoice, ExternalInvoiceCreate, ExternalInvoiceUpdate, Supplier, Project, Part, PaymentToSupplier

def create_external_invoice_db(session: Session, external_invoice_in: ExternalInvoiceCreate) -> ExternalInvoice:
    supplier = session.get(Supplier, external_invoice_in.supplier_id)
    if not supplier:
        raise ValueError("Supplier not found")

    project = session.get(Project, external_invoice_in.project_id)
    if not project:
        raise ValueError("Project not found")

    vat = round(external_invoice_in.amount_ttc - external_invoice_in.amount_ht, 2)

    external_invoice = ExternalInvoice(
        reference=external_invoice_in.reference,
        invoice_date=external_invoice_in.invoice_date,
        due_date=external_invoice_in.due_date,
        amount_ttc=external_invoice_in.amount_ttc,
        amount_ht=external_invoice_in.amount_ht,
        vat=vat,
        currency_type=external_invoice_in.currency_type,
        supplier_id=external_invoice_in.supplier_id,
        project_id=external_invoice_in.project_id
    )

    session.add(external_invoice)
    session.commit()
    session.refresh(external_invoice)
    return external_invoice

def get_external_invoice_db(session: Session, external_invoice_id: int) -> Optional[ExternalInvoice]:
    return session.get(ExternalInvoice, external_invoice_id)

def get_external_invoices_db(session: Session, skip: int = 0, limit: int = 100) -> List[ExternalInvoice]:
    return session.exec(select(ExternalInvoice).offset(skip).limit(limit)).all()

def get_external_invoices_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(ExternalInvoice)).one()

def update_external_invoice_db(session: Session, external_invoice: ExternalInvoice, external_invoice_in: ExternalInvoiceUpdate) -> ExternalInvoice:
    external_invoice_data = external_invoice_in.model_dump(exclude_unset=True)
    for key, value in external_invoice_data.items():
        setattr(external_invoice, key, value)
    session.add(external_invoice)
    session.commit()
    session.refresh(external_invoice)
    return external_invoice

def delete_external_invoice_db(session: Session, external_invoice: ExternalInvoice) -> ExternalInvoice:
    session.delete(external_invoice)
    session.commit()
    return external_invoice

def get_external_invoice_parts_db(session: Session, external_invoice_id: int) -> List[Part]:
    external_invoice = session.get(ExternalInvoice, external_invoice_id)
    return external_invoice.parts if external_invoice else []

def get_external_invoice_part_db(session: Session, external_invoice_id: int, part_id: int) -> Optional[Part]:
    return session.exec(select(Part).where(Part.id == part_id, Part.external_invoice_id == external_invoice_id)).first()

def get_external_invoice_payments_db(session: Session, external_invoice_id: int) -> List[PaymentToSupplier]:
    external_invoice = session.get(ExternalInvoice, external_invoice_id)
    return external_invoice.payments_to_suppliers if external_invoice else []