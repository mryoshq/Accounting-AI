from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.models import PaymentToSupplier, PaymentToSupplierCreate, PaymentToSupplierPublic, PaymentToSuppliersPublic, PaymentToSupplierUpdate, ExternalInvoice
from app.models import Supplier, Project
router = APIRouter()

# --- PaymentToSuppliers Endpoints ---
@router.get("/", response_model=PaymentToSuppliersPublic)
def read_payments_to_suppliers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve payments to suppliers.
    """
    count_statement = select(func.count()).select_from(PaymentToSupplier)
    count = session.exec(count_statement).one()
    statement = select(PaymentToSupplier).offset(skip).limit(limit)
    payments = session.exec(statement).all()
    return PaymentToSuppliersPublic(data=payments, count=count)

@router.get("/{payment_id}", response_model=PaymentToSupplierPublic)
def read_payment_to_supplier(
    session: SessionDep, current_user: CurrentUser, payment_id: int
) -> Any:
    """
    Get payment to supplier by ID.
    """
    payment = session.get(PaymentToSupplier, payment_id)
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
    # Check if external invoice exists
    external_invoice = session.get(ExternalInvoice, payment_in.external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")

    # Deduce project_id and supplier_id from external_invoice
    project_id = external_invoice.project_id
    supplier_id = external_invoice.supplier_id

    # Check if project exists
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if supplier exists
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    payment_data = payment_in.dict()
    payment_data["project_id"] = project_id
    payment_data["supplier_id"] = supplier_id

    payment = PaymentToSupplier(**payment_data)
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment








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
    payment = session.get(PaymentToSupplier, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment to supplier not found")

    if payment_in.external_invoice_id is not None:
        # Check if external invoice exists
        external_invoice = session.get(ExternalInvoice, payment_in.external_invoice_id)
        if not external_invoice:
            raise HTTPException(status_code=404, detail="External invoice not found")

        # Deduce project_id and supplier_id from external_invoice
        project_id = external_invoice.project_id
        supplier_id = external_invoice.supplier_id

        # Check if project exists
        project = session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check if supplier exists
        supplier = session.get(Supplier, supplier_id)
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")

        payment.project_id = project_id
        payment.supplier_id = supplier_id

    payment_data = payment_in.dict(exclude_unset=True)
    for key, value in payment_data.items():
        setattr(payment, key, value)
    
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment






@router.delete("/{payment_id}", response_model=PaymentToSupplierPublic)
def delete_payment_to_supplier(
    session: SessionDep, current_user: CurrentUser, payment_id: int
) -> Any:
    """
    Delete payment to supplier.
    """
    payment_to_supplier = session.get(PaymentToSupplier, payment_id)
    if not payment_to_supplier:
        raise HTTPException(status_code=404, detail="Payment to supplier not found")

    session.delete(payment_to_supplier)
    session.commit()
    return payment_to_supplier

