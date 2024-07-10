from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Customer, 
    CustomerCreate, 
    CustomerPublic, 
    CustomersPublic, 
    CustomerUpdate
    )
from app.models import (
    CustomerContact, 
    CustomerContactCreate, 
    CustomerContactPublic, 
    CustomerContactsPublic, 
    CustomerContactUpdate,
    )
from app.models import InternalInvoicesPublic
from app.models import PaymentFromCustomersPublic

router = APIRouter()

# --- Customer Endpoints ---

@router.get("/", response_model=CustomersPublic)
def read_customers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve customers.
    """
    count_statement = select(func.count()).select_from(Customer)
    count = session.exec(count_statement).one()
    statement = select(Customer).offset(skip).limit(limit)
    customers = session.exec(statement).all()
    return CustomersPublic(data=customers, count=count)

@router.get("/contacts", response_model=CustomerContactsPublic)
def read_all_customer_contacts(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all customer contacts.
    """
    count_statement = select(func.count()).select_from(CustomerContact)
    count = session.exec(count_statement).one()
    statement = select(CustomerContact).offset(skip).limit(limit)
    contacts = session.exec(statement).all()
    return CustomerContactsPublic(data=contacts, count=count)

@router.get("/{customer_id}", response_model=CustomerPublic)
def read_customer(session: SessionDep, current_user: CurrentUser, customer_id: int) -> Any:
    """
    Get customer by ID.
    """
    customer = session.get(Customer, customer_id)
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
    customer = Customer.from_orm(customer_in)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

@router.put("/{customer_id}", response_model=CustomerPublic)
def update_customer(
    *, session: SessionDep, current_user: CurrentUser, customer_id: int, customer_in: CustomerUpdate
) -> Any:
    """
    Update an existing customer.
    """
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer_data = customer_in.dict(exclude_unset=True)
    for key, value in customer_data.items():
        setattr(customer, key, value)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

@router.delete("/{customer_id}", response_model=CustomerPublic)
def delete_customer(session: SessionDep, current_user: CurrentUser, customer_id: int) -> Any:
    """
    Delete customer.
    """
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    session.delete(customer)
    session.commit()
    return customer

# --- Customer Contact Endpoints --- 

@router.get("/{customer_id}/contacts", response_model=CustomerContactsPublic)
def read_customer_contacts(
    session: SessionDep, current_user: CurrentUser, customer_id: int
) -> Any:
    """
    Retrieve customer contacts.
    """
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerContactsPublic(data=customer.contacts, count=len(customer.contacts))

@router.get("/contacts/{contact_id}", response_model=CustomerContactPublic)
def read_contact(
    session: SessionDep, current_user: CurrentUser, contact_id: int
) -> Any:
    """
    Read contact by contact ID.
    """
    contact = session.get(CustomerContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Customer contact not found")
    return contact

@router.get("/{customer_id}/contacts/{contact_id}", response_model=CustomerContactPublic)
def read_customer_contact(
    session: SessionDep,
    current_user: CurrentUser,
    customer_id: int,
    contact_id: int,
) -> Any:
    """Get contact by customer ID and contact ID."""
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    contact = (
        session.query(CustomerContact)
        .filter(
            CustomerContact.id == contact_id,
            CustomerContact.customer_id == customer_id,
        )
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=404, detail="Customer contact not found for this customer"
        )

    return CustomerContactPublic.from_orm(contact)



@router.post("/{customer_id}/contacts", response_model=CustomerContactPublic)
def create_customer_contact(
    *, 
    session: SessionDep, 
    current_user: CurrentUser, 
    contact_in: CustomerContactCreate,
) -> Any:
    """Create new customer contact."""
    customer = session.get(Customer, contact_in.customer_id)  # Use customer_id from contact_in
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    contact = CustomerContact(**contact_in.dict())
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

@router.put("/contacts/{contact_id}", response_model=CustomerContactPublic)
def update_customer_contact(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    contact_id: int,
    contact_in: CustomerContactUpdate,
) -> Any:
    """Update customer contact."""
    contact = session.get(CustomerContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Customer contact not found")
    
    if contact.customer_id != contact_in.customer_id:
        raise HTTPException(status_code=400, detail="Customer ID mismatch")

    contact_data = contact_in.dict(exclude_unset=True)
    for key, value in contact_data.items():
        setattr(contact, key, value)

    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact


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
    contact = session.get(CustomerContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Customer contact not found")
    
    session.delete(contact)
    session.commit()

    return contact





# --- customer invoices endpoints ---

@router.get("/{customer_id}/internalinvoices", response_model=InternalInvoicesPublic)
def read_internal_invoices_for_customer(
    session: SessionDep, 
    current_user: CurrentUser, 
    customer_id: int
) -> Any:
    """
    Retrieve all internal invoices for a specific customer.
    """
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="No Invoices found for this Customer ID")

    invoices = customer.internal_invoices
    return InternalInvoicesPublic(data=invoices, count=len(invoices))


# --- payments from customers endpoints ---

@router.get("/{customer_id}/payments", response_model=PaymentFromCustomersPublic)
def read_payments_from_customer(
    session: SessionDep, 
    current_user: CurrentUser, 
    customer_id: int
) -> Any:
    """
    Retrieve all payments from a specific customer.
    """
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Retrieve payments directly using the relationship
    payments = customer.payments_from_customers

    return PaymentFromCustomersPublic(data=payments, count=len(payments))