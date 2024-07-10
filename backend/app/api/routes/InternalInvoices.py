from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlmodel import select, func
from typing import Any, List

from app.api.deps import ( 
    CurrentUser, 
    SessionDep
)
from app.models import  ( 
    InternalInvoice, 
    InternalInvoiceCreate, 
    InternalInvoicePublic, 
    InternalInvoicesPublic, 
    InternalInvoiceUpdate
    )
from app.models import ( 
    Customer, 
    Project
)
from app.models import (
    PaymentFromCustomersPublic
)
from app.models import InvoiceProcessingResponse
from app.api import gpt_process
 
router = APIRouter()

# --- Internal Invoice Endpoints ---
@router.get("/", response_model=InternalInvoicesPublic)
def read_internal_invoices(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all internal invoices.
    """
    count_statement = select(func.count()).select_from(InternalInvoice)
    count = session.exec(count_statement).one()
    statement = select(InternalInvoice).offset(skip).limit(limit)
    internal_invoices = session.exec(statement).all()
    return InternalInvoicesPublic(data=internal_invoices, count=count)

@router.get("/{internal_invoice_id}", response_model=InternalInvoicePublic)
def read_internal_invoice(
    session: SessionDep, current_user: CurrentUser, internal_invoice_id: int
) -> Any:
    """
    Get internal invoice by ID.
    """
    internal_invoice = session.get(InternalInvoice, internal_invoice_id)
    if not internal_invoice:
        raise HTTPException(status_code=404, detail="Internal invoice not found")
    return internal_invoice

@router.post("/", response_model=InternalInvoicePublic)
def create_internal_invoice(
    *, 
    session: SessionDep, 
    current_user: CurrentUser, 
    internal_invoice_in: InternalInvoiceCreate
) -> Any:
    """
    Create new internal invoice.
    """
    # Check if customer exists
    customer = session.get(Customer, internal_invoice_in.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Check if project exists
    project = session.get(Project, internal_invoice_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Calculate VAT if not provided
    vat = internal_invoice_in.amount_ttc - internal_invoice_in.amount_ht

    # Create the invoice with the calculated VAT
    internal_invoice = InternalInvoice(
        reference=internal_invoice_in.reference,
        invoice_date=internal_invoice_in.invoice_date,
        due_date=internal_invoice_in.due_date,
        amount_ttc=internal_invoice_in.amount_ttc,
        amount_ht=internal_invoice_in.amount_ht,
        vat=vat,
        currency_type=internal_invoice_in.currency_type,
        customer_id=internal_invoice_in.customer_id,
        project_id=internal_invoice_in.project_id
    )

    session.add(internal_invoice)
    session.commit()
    session.refresh(internal_invoice)
    return internal_invoice


@router.patch("/{internal_invoice_id}", response_model=InternalInvoicePublic)
def update_internal_invoice(
    *, 
    session: SessionDep, 
    current_user: CurrentUser, 
    internal_invoice_id: int, 
    internal_invoice_in: InternalInvoiceUpdate
) -> Any:
    """
    Update an existing internal invoice.
    """
    internal_invoice = session.get(InternalInvoice, internal_invoice_id)
    if not internal_invoice:
        raise HTTPException(status_code=404, detail="Internal invoice not found")
    internal_invoice_data = internal_invoice_in.dict(exclude_unset=True)
    for key, value in internal_invoice_data.items():
        setattr(internal_invoice, key, value)
    session.add(internal_invoice)
    session.commit()
    session.refresh(internal_invoice)
    return internal_invoice

@router.delete("/{internal_invoice_id}", response_model=InternalInvoicePublic)
def delete_internal_invoice(
    session: SessionDep, current_user: CurrentUser, internal_invoice_id: int
) -> Any:
    """
    Delete internal invoice.
    """
    internal_invoice = session.get(InternalInvoice, internal_invoice_id)
    if not internal_invoice:
        raise HTTPException(status_code=404, detail="Internal invoice not found")
    session.delete(internal_invoice)
    session.commit()
    return internal_invoice




# --- payments from customers ---
@router.get("/{internal_invoice_id}/payments", response_model=PaymentFromCustomersPublic)
def read_payments_for_internal_invoice(
    session: SessionDep, 
    current_user: CurrentUser, 
    internal_invoice_id: int
) -> Any:
    """
    Retrieve all payments from customers for a specific internal invoice.
    """
    internal_invoice = session.get(InternalInvoice, internal_invoice_id)
    if not internal_invoice:
        raise HTTPException(status_code=404, detail="Internal invoice not found")

    payments = internal_invoice.payments_from_customers
    return PaymentFromCustomersPublic(data=payments, count=len(payments))



# --- AI invoice process endpoints --- 
# --- Process Internal Invoice into openai pipeline---


@router.post("/process_invoice", response_model=InvoiceProcessingResponse)
def process_internal_invoices(
    session: SessionDep, 
    current_user: CurrentUser, 
    files: List[UploadFile] = File(...)
) -> InvoiceProcessingResponse:
    """
    Process internal invoices and extract relevant information.
    """
    try:
        results = gpt_process.pipeline(files, debug=True)
        return InvoiceProcessingResponse(data=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))