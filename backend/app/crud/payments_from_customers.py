# app/crud/payments_from_customers.py

from sqlmodel import Session, select, func
from typing import List, Optional

from app.models import PaymentFromCustomer, PaymentFromCustomerCreate, PaymentFromCustomerUpdate, InternalInvoice, Customer, Project

def create_payment_from_customer_db(session: Session, payment_in: PaymentFromCustomerCreate) -> PaymentFromCustomer:
    internal_invoice = session.get(InternalInvoice, payment_in.internal_invoice_id)
    if not internal_invoice:
        raise ValueError("Internal invoice not found")

    project_id = internal_invoice.project_id
    customer_id = internal_invoice.customer_id

    project = session.get(Project, project_id)
    if not project:
        raise ValueError("Project not found")

    customer = session.get(Customer, customer_id)
    if not customer:
        raise ValueError("Customer not found")

    payment_data = payment_in.model_dump()
    payment_data["project_id"] = project_id
    payment_data["customer_id"] = customer_id

    payment = PaymentFromCustomer.model_validate(payment_data)
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment

def get_payment_from_customer_db(session: Session, payment_id: int) -> Optional[PaymentFromCustomer]:
    return session.get(PaymentFromCustomer, payment_id)

def get_payments_from_customers_db(session: Session, skip: int = 0, limit: int = 100) -> List[PaymentFromCustomer]:
    return session.exec(select(PaymentFromCustomer).offset(skip).limit(limit)).all()

def get_payments_from_customers_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(PaymentFromCustomer)).one()

def update_payment_from_customer_db(session: Session, payment: PaymentFromCustomer, payment_in: PaymentFromCustomerUpdate) -> PaymentFromCustomer:
    if payment_in.internal_invoice_id is not None:
        internal_invoice = session.get(InternalInvoice, payment_in.internal_invoice_id)
        if not internal_invoice:
            raise ValueError("Internal invoice not found")

        project_id = internal_invoice.project_id
        customer_id = internal_invoice.customer_id

        project = session.get(Project, project_id)
        if not project:
            raise ValueError("Project not found")

        customer = session.get(Customer, customer_id)
        if not customer:
            raise ValueError("Customer not found")

        payment.project_id = project_id
        payment.customer_id = customer_id

    payment_data = payment_in.model_dump(exclude_unset=True)
    for key, value in payment_data.items():
        setattr(payment, key, value)
    
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment

def delete_payment_from_customer_db(session: Session, payment: PaymentFromCustomer) -> PaymentFromCustomer:
    session.delete(payment)
    session.commit()
    return payment