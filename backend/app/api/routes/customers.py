# app/api/routes/customers.py

from typing import Any
from fastapi import APIRouter, HTTPException
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    CustomerCreate, 
    CustomerPublic, 
    CustomersPublic, 
    CustomerUpdate,
    CustomerContactCreate, 
    CustomerContactPublic, 
    CustomerContactsPublic, 
    CustomerContactUpdate,
    InternalInvoicesPublic,
    PaymentFromCustomersPublic
)
from app.crud import customers as customers_crud

router = APIRouter()

@router.get("/", response_model=CustomersPublic)
def read_customers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve customers.
    """
    customers = customers_crud.get_customers_db(session, skip=skip, limit=limit)
    count = customers_crud.get_customers_count_db(session)
    return CustomersPublic(data=customers, count=count)

@router.get("/contacts", response_model=CustomerContactsPublic)
def read_all_customer_contacts(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all customer contacts.
    """
    contacts = customers_crud.get_all_customer_contacts_db(session, skip=skip, limit=limit)
    count = customers_crud.get_customer_contacts_count_db(session)
    return CustomerContactsPublic(data=contacts, count=count)

@router.get("/{customer_id}", response_model=CustomerPublic)
def read_customer(session: SessionDep, current_user: CurrentUser, customer_id: int) -> Any:
    """
    Get customer by ID.
    """
    customer = customers_crud.get_customer_db(session, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=CustomerPublic)
def create_customer(
    *, session: SessionDep, current_user: CurrentUser, customer_in: CustomerCreate
) -> Any:
    """
    Create new customer.
    """
    return customers_crud.create_customer_db(session, customer_in)

@router.put("/{customer_id}", response_model=CustomerPublic)
def update_customer(
    *, session: SessionDep, current_user: CurrentUser, customer_id: int, customer_in: CustomerUpdate
) -> Any:
    """
    Update an existing customer.
    """
    customer = customers_crud.get_customer_db(session, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customers_crud.update_customer_db(session, customer, customer_in)

@router.delete("/{customer_id}", response_model=CustomerPublic)
def delete_customer(session: SessionDep, current_user: CurrentUser, customer_id: int) -> Any:
    """
    Delete customer.
    """
    customer = customers_crud.get_customer_db(session, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customers_crud.delete_customer_db(session, customer)

@router.get("/{customer_id}/contacts", response_model=CustomerContactsPublic)
def read_customer_contacts(
    session: SessionDep, current_user: CurrentUser, customer_id: int
) -> Any:
    """
    Retrieve customer contacts.
    """
    customer = customers_crud.get_customer_db(session, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    contacts = customers_crud.get_customer_contacts_db(session, customer_id)
    return CustomerContactsPublic(data=contacts, count=len(contacts))

@router.get("/contacts/{contact_id}", response_model=CustomerContactPublic)
def read_contact(
    session: SessionDep, current_user: CurrentUser, contact_id: int
) -> Any:
    """
    Read contact by contact ID.
    """
    contact = customers_crud.get_customer_contact_db(session, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Customer contact not found")
    return contact

@router.post("/{customer_id}/contacts", response_model=CustomerContactPublic)
def create_customer_contact(
    *, 
    session: SessionDep, 
    current_user: CurrentUser, 
    contact_in: CustomerContactCreate,
) -> Any:
    """Create new customer contact."""
    customer = customers_crud.get_customer_db(session, contact_in.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customers_crud.create_customer_contact_db(session, contact_in)

@router.put("/contacts/{contact_id}", response_model=CustomerContactPublic)
def update_customer_contact(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    contact_id: int,
    contact_in: CustomerContactUpdate,
) -> Any:
    """Update customer contact."""
    contact = customers_crud.get_customer_contact_db(session, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Customer contact not found")
    if contact.customer_id != contact_in.customer_id:
        raise HTTPException(status_code=400, detail="Customer ID mismatch")
    return customers_crud.update_customer_contact_db(session, contact, contact_in)

@router.delete("/contacts/{contact_id}", response_model=CustomerContactPublic)
def delete_customer_contact(
    *,
    session: SessionDep, 
    current_user: CurrentUser, 
    contact_id: int
) -> Any:
    """
    Delete customer contact.
    """
    contact = customers_crud.get_customer_contact_db(session, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Customer contact not found")
    return customers_crud.delete_customer_contact_db(session, contact)

@router.get("/{customer_id}/internalinvoices", response_model=InternalInvoicesPublic)
def read_internal_invoices_for_customer(
    session: SessionDep, 
    current_user: CurrentUser, 
    customer_id: int
) -> Any:
    """
    Retrieve all internal invoices for a specific customer.
    """
    customer = customers_crud.get_customer_db(session, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="No Invoices found for this Customer ID")
    invoices = customers_crud.get_customer_internal_invoices_db(session, customer_id)
    return InternalInvoicesPublic(data=invoices, count=len(invoices))

@router.get("/{customer_id}/payments", response_model=PaymentFromCustomersPublic)
def read_payments_from_customer(
    session: SessionDep, 
    current_user: CurrentUser, 
    customer_id: int
) -> Any:
    """
    Retrieve all payments from a specific customer.
    """
    customer = customers_crud.get_customer_db(session, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    payments = customers_crud.get_customer_payments_db(session, customer_id)
    return PaymentFromCustomersPublic(data=payments, count=len(payments))