# app/crud/customers.py

from sqlmodel import Session, select, func
from typing import List, Optional

from app.models import (
    Customer,
    CustomerCreate,
    CustomerUpdate,
    CustomerContact,
    CustomerContactCreate,
    CustomerContactUpdate,
    InternalInvoice,
    PaymentFromCustomer
)

def create_customer_db(session: Session, customer_in: CustomerCreate) -> Customer:
    customer = Customer.model_validate(customer_in)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

def get_customer_db(session: Session, customer_id: int) -> Optional[Customer]:
    return session.get(Customer, customer_id)

def get_customers_db(session: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
    return session.exec(select(Customer).offset(skip).limit(limit)).all()

def get_customers_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(Customer)).one()

def update_customer_db(session: Session, customer: Customer, customer_in: CustomerUpdate) -> Customer:
    customer_data = customer_in.model_dump(exclude_unset=True)
    for key, value in customer_data.items():
        setattr(customer, key, value)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

def delete_customer_db(session: Session, customer: Customer) -> Customer:
    session.delete(customer)
    session.commit()
    return customer

def get_customer_contacts_db(session: Session, customer_id: int) -> List[CustomerContact]:
    customer = session.get(Customer, customer_id)
    return customer.contacts if customer else []

def get_customer_contacts_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(CustomerContact)).one()

def get_all_customer_contacts_db(session: Session, skip: int = 0, limit: int = 100) -> List[CustomerContact]:
    return session.exec(select(CustomerContact).offset(skip).limit(limit)).all()

def get_customer_contact_db(session: Session, contact_id: int) -> Optional[CustomerContact]:
    return session.get(CustomerContact, contact_id)

def create_customer_contact_db(session: Session, contact_in: CustomerContactCreate) -> CustomerContact:
    contact = CustomerContact.model_validate(contact_in)
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

def update_customer_contact_db(session: Session, contact: CustomerContact, contact_in: CustomerContactUpdate) -> CustomerContact:
    contact_data = contact_in.model_dump(exclude_unset=True)
    for key, value in contact_data.items():
        setattr(contact, key, value)
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

def delete_customer_contact_db(session: Session, contact: CustomerContact) -> CustomerContact:
    session.delete(contact)
    session.commit()
    return contact

def get_customer_internal_invoices_db(session: Session, customer_id: int) -> List[InternalInvoice]:
    customer = session.get(Customer, customer_id)
    return customer.internal_invoices if customer else []

def get_customer_payments_db(session: Session, customer_id: int) -> List[PaymentFromCustomer]:
    customer = session.get(Customer, customer_id)
    return customer.payments_from_customers if customer else []