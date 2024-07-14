# app/api/routes/paymentsfromcustomer.py

from fastapi import APIRouter, HTTPException
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.models import PaymentFromCustomerCreate, PaymentFromCustomerPublic, PaymentFromCustomersPublic, PaymentFromCustomerUpdate
from app.crud import payments_from_customers as payments_crud

router = APIRouter()

@router.get("/", response_model=PaymentFromCustomersPublic)
def read_payments_from_customers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve payments from customers.
    """
    payments = payments_crud.get_payments_from_customers_db(session, skip, limit)
    count = payments_crud.get_payments_from_customers_count_db(session)
    return PaymentFromCustomersPublic(data=payments, count=count)

@router.get("/{payment_id}", response_model=PaymentFromCustomerPublic)
def read_payment_from_customer(
    session: SessionDep, current_user: CurrentUser, payment_id: int
) -> Any:
    """
    Get payment from customer by ID.
    """
    payment = payments_crud.get_payment_from_customer_db(session, payment_id)
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
    try:
        return payments_crud.create_payment_from_customer_db(session, payment_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

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
    payment = payments_crud.get_payment_from_customer_db(session, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment from customer not found")
    
    try:
        return payments_crud.update_payment_from_customer_db(session, payment, payment_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{payment_id}", response_model=PaymentFromCustomerPublic)
def delete_payment_from_customer(
    session: SessionDep,
    current_user: CurrentUser,
    payment_id: int
) -> Any:
    """
    Delete payment from customer.
    """
    payment = payments_crud.get_payment_from_customer_db(session, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment from customer not found")

    return payments_crud.delete_payment_from_customer_db(session, payment)