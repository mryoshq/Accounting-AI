from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from typing import Any, List

from app.api.deps import CurrentUser, SessionDep
from app.models import PaymentFromCustomer, PaymentFromCustomerCreate, PaymentFromCustomerPublic, PaymentFromCustomersPublic, PaymentFromCustomerUpdate, InternalInvoice
from app.models import Customer, Project

router = APIRouter()

# --- PaymentFromCustomers Endpoints ---

@router.get("/", response_model=PaymentFromCustomersPublic)
def read_payments_from_customers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve payments from customers.
    """
    count_statement = select(func.count()).select_from(PaymentFromCustomer)
    count = session.exec(count_statement).one()
    statement = select(PaymentFromCustomer).offset(skip).limit(limit)
    payments = session.exec(statement).all()
    return PaymentFromCustomersPublic(data=payments, count=count)

@router.get("/{payment_id}", response_model=PaymentFromCustomerPublic)
def read_payment_from_customer(
    session: SessionDep, current_user: CurrentUser, payment_id: int
) -> Any:
    """
    Get payment from customer by ID.
    """
    payment = session.get(PaymentFromCustomer, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment from customer not found")
    return payment




@router.post("/", response_model=PaymentFromCustomerPublic)
def create_payment_from_customer(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payment_in: PaymentFromCustomerCreate
) -> Any:
    """
    Create new payment from customer.
    """
    # Check if internal invoice exists
    internal_invoice = session.get(InternalInvoice, payment_in.internal_invoice_id)
    if not internal_invoice:
        raise HTTPException(status_code=404, detail="Internal invoice not found")

    # Deduce project_id and customer_id from internal_invoice
    project_id = internal_invoice.project_id
    customer_id = internal_invoice.customer_id

    # Check if project exists
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if customer exists
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    payment_data = payment_in.dict()
    payment_data["project_id"] = project_id
    payment_data["customer_id"] = customer_id

    payment = PaymentFromCustomer(**payment_data)
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment



@router.patch("/{payment_id}", response_model=PaymentFromCustomerPublic)
def patch_payment_from_customer(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payment_id: int,
    payment_in: PaymentFromCustomerUpdate
) -> Any:
    """
    Patch an existing payment from customer.
    """
    payment = session.get(PaymentFromCustomer, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment from customer not found")

    if payment_in.internal_invoice_id is not None:
        # Check if internal invoice exists
        internal_invoice = session.get(InternalInvoice, payment_in.internal_invoice_id)
        if not internal_invoice:
            raise HTTPException(status_code=404, detail="Internal invoice not found")

        # Deduce project_id and customer_id from internal_invoice
        project_id = internal_invoice.project_id
        customer_id = internal_invoice.customer_id

        # Check if project exists
        project = session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check if customer exists
        customer = session.get(Customer, customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        payment.project_id = project_id
        payment.customer_id = customer_id

    payment_data = payment_in.dict(exclude_unset=True)
    for key, value in payment_data.items():
        setattr(payment, key, value)
    
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment


@router.delete("/{payment_id}", response_model=PaymentFromCustomerPublic)
def delete_payment_from_customer(
    session: SessionDep,
    current_user: CurrentUser,
    payment_id: int
) -> Any:
    """
    Delete payment from customer.
    """
    payment = session.get(PaymentFromCustomer, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment from customer not found")

    session.delete(payment)
    session.commit()
    return payment
