# app/crud/payments_to_suppliers.py

from sqlmodel import Session, select, func
from typing import List, Optional

from app.models import PaymentToSupplier, PaymentToSupplierCreate, PaymentToSupplierUpdate, ExternalInvoice, Supplier, Project

def create_payment_to_supplier_db(session: Session, payment_in: PaymentToSupplierCreate) -> PaymentToSupplier:
    external_invoice = session.get(ExternalInvoice, payment_in.external_invoice_id)
    if not external_invoice:
        raise ValueError("External invoice not found")

    project_id = external_invoice.project_id
    supplier_id = external_invoice.supplier_id

    project = session.get(Project, project_id)
    if not project:
        raise ValueError("Project not found")

    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise ValueError("Supplier not found")

    payment_data = payment_in.model_dump()
    payment_data["project_id"] = project_id
    payment_data["supplier_id"] = supplier_id

    payment = PaymentToSupplier.model_validate(payment_data)
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment

def get_payment_to_supplier_db(session: Session, payment_id: int) -> Optional[PaymentToSupplier]:
    return session.get(PaymentToSupplier, payment_id)

def get_payments_to_suppliers_db(session: Session, skip: int = 0, limit: int = 100) -> List[PaymentToSupplier]:
    return session.exec(select(PaymentToSupplier).offset(skip).limit(limit)).all()

def get_payments_to_suppliers_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(PaymentToSupplier)).one()

def update_payment_to_supplier_db(session: Session, payment: PaymentToSupplier, payment_in: PaymentToSupplierUpdate) -> PaymentToSupplier:
    if payment_in.external_invoice_id is not None:
        external_invoice = session.get(ExternalInvoice, payment_in.external_invoice_id)
        if not external_invoice:
            raise ValueError("External invoice not found")

        project_id = external_invoice.project_id
        supplier_id = external_invoice.supplier_id

        project = session.get(Project, project_id)
        if not project:
            raise ValueError("Project not found")

        supplier = session.get(Supplier, supplier_id)
        if not supplier:
            raise ValueError("Supplier not found")

        payment.project_id = project_id
        payment.supplier_id = supplier_id

    payment_data = payment_in.model_dump(exclude_unset=True)
    for key, value in payment_data.items():
        setattr(payment, key, value)
    
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment

def delete_payment_to_supplier_db(session: Session, payment: PaymentToSupplier) -> PaymentToSupplier:
    session.delete(payment)
    session.commit()
    return payment