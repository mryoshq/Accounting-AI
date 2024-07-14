# app/api/routes/paymentstosupplier.py

from fastapi import APIRouter, HTTPException
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.models import PaymentToSupplierCreate, PaymentToSupplierPublic, PaymentToSuppliersPublic, PaymentToSupplierUpdate
from app.crud import payments_to_suppliers as payments_crud

router = APIRouter()

@router.get("/", response_model=PaymentToSuppliersPublic)
def read_payments_to_suppliers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve payments to suppliers.
    """
    payments = payments_crud.get_payments_to_suppliers_db(session, skip, limit)
    count = payments_crud.get_payments_to_suppliers_count_db(session)
    return PaymentToSuppliersPublic(data=payments, count=count)

@router.get("/{payment_id}", response_model=PaymentToSupplierPublic)
def read_payment_to_supplier(
    session: SessionDep, current_user: CurrentUser, payment_id: int
) -> Any:
    """
    Get payment to supplier by ID.
    """
    payment = payments_crud.get_payment_to_supplier_db(session, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment to supplier not found")
    return payment

@router.post("/", response_model=PaymentToSupplierPublic)
def create_payment_to_supplier(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payment_in: PaymentToSupplierCreate
) -> Any:
    """
    Create new payment to supplier.
    """
    try:
        return payments_crud.create_payment_to_supplier_db(session, payment_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{payment_id}", response_model=PaymentToSupplierPublic)
def patch_payment_to_supplier(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payment_id: int,
    payment_in: PaymentToSupplierUpdate
) -> Any:
    """
    Patch an existing payment to supplier.
    """
    payment = payments_crud.get_payment_to_supplier_db(session, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment to supplier not found")

    try:
        return payments_crud.update_payment_to_supplier_db(session, payment, payment_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{payment_id}", response_model=PaymentToSupplierPublic)
def delete_payment_to_supplier(
    session: SessionDep, current_user: CurrentUser, payment_id: int
) -> Any:
    """
    Delete payment to supplier.
    """
    payment = payments_crud.get_payment_to_supplier_db(session, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment to supplier not found")

    return payments_crud.delete_payment_to_supplier_db(session, payment)