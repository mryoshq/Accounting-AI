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
        # Check if user has an active API token
        if not current_user.api_token_enabled:
            raise HTTPException(
                status_code=403, 
                detail="User does not have an active API token"
            )
            
        results = gpt_process.pipeline(files, current_user.id, debug=True)
        return InvoiceProcessingResponse(data=results)
    except ValueError as e:
        # Handle specific errors like missing or invalid API key
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing invoice: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing invoice: {str(e)}"
        )