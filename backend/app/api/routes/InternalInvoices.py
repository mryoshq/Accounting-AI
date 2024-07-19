# app/api/routes/InternalInvoices.py

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Any, List

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    InternalInvoiceCreate,
    InternalInvoicePublic,
    InternalInvoicesPublic,
    InternalInvoiceUpdate
)
from app.models import PaymentFromCustomersPublic
from app.models import InvoiceProcessingResponse
from app.api.routes.tools import gpt_process
from app.crud import internal_invoices as internal_invoices_crud

router = APIRouter()

@router.get("/", response_model=InternalInvoicesPublic)
def read_internal_invoices(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all internal invoices.
    """
    internal_invoices = internal_invoices_crud.get_internal_invoices_db(session, skip, limit)
    count = internal_invoices_crud.get_internal_invoices_count_db(session)
    return InternalInvoicesPublic(data=internal_invoices, count=count)

@router.get("/{internal_invoice_id}", response_model=InternalInvoicePublic)
def read_internal_invoice(
    session: SessionDep, current_user: CurrentUser, internal_invoice_id: int
) -> Any:
    """
    Get internal invoice by ID.
    """
    internal_invoice = internal_invoices_crud.get_internal_invoice_db(session, internal_invoice_id)
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
    try:
        return internal_invoices_crud.create_internal_invoice_db(session, internal_invoice_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

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
    internal_invoice = internal_invoices_crud.get_internal_invoice_db(session, internal_invoice_id)
    if not internal_invoice:
        raise HTTPException(status_code=404, detail="Internal invoice not found")
    return internal_invoices_crud.update_internal_invoice_db(session, internal_invoice, internal_invoice_in)

@router.delete("/{internal_invoice_id}", response_model=InternalInvoicePublic)
def delete_internal_invoice(
    session: SessionDep, current_user: CurrentUser, internal_invoice_id: int
) -> Any:
    """
    Delete internal invoice.
    """
    internal_invoice = internal_invoices_crud.get_internal_invoice_db(session, internal_invoice_id)
    if not internal_invoice:
        raise HTTPException(status_code=404, detail="Internal invoice not found")
    return internal_invoices_crud.delete_internal_invoice_db(session, internal_invoice)

@router.get("/{internal_invoice_id}/payments", response_model=PaymentFromCustomersPublic)
def read_payments_for_internal_invoice(
    session: SessionDep, 
    current_user: CurrentUser, 
    internal_invoice_id: int
) -> Any:
    """
    Retrieve all payments from customers for a specific internal invoice.
    """
    internal_invoice = internal_invoices_crud.get_internal_invoice_db(session, internal_invoice_id)
    if not internal_invoice:
        raise HTTPException(status_code=404, detail="Internal invoice not found")

    payments = internal_invoices_crud.get_internal_invoice_payments_db(session, internal_invoice_id)
    return PaymentFromCustomersPublic(data=payments, count=len(payments))

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