# app/api/routes/ExternalInvoices.py

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Any, List

from app.api.deps import CurrentUser, SessionDep
from app.api.routes.tools import gpt_process
from app.models import ExternalInvoiceCreate, ExternalInvoicePublic, ExternalInvoicesPublic, ExternalInvoiceUpdate
from app.models import PartPublic, PartsPublic
from app.models import PaymentToSuppliersPublic
from app.models import InvoiceProcessingResponse
from app.crud import external_invoices as external_invoices_crud

router = APIRouter()

@router.get("/", response_model=ExternalInvoicesPublic)
def read_external_invoices(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve external invoices.
    """
    external_invoices = external_invoices_crud.get_external_invoices_db(session, skip, limit)
    count = external_invoices_crud.get_external_invoices_count_db(session)
    return ExternalInvoicesPublic(data=external_invoices, count=count)

@router.get("/{external_invoice_id}", response_model=ExternalInvoicePublic)
def read_external_invoice(
    session: SessionDep, current_user: CurrentUser, external_invoice_id: int
) -> Any:
    """
    Get external invoice by ID.
    """
    external_invoice = external_invoices_crud.get_external_invoice_db(session, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")
    return external_invoice

@router.post("/", response_model=ExternalInvoicePublic)
def create_external_invoice(
    *, 
    session: SessionDep, 
    current_user: CurrentUser, 
    external_invoice_in: ExternalInvoiceCreate
) -> Any:
    """
    Create new external invoice.
    """
    try:
        return external_invoices_crud.create_external_invoice_db(session, external_invoice_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{external_invoice_id}", response_model=ExternalInvoicePublic)
def update_external_invoice(
    *, 
    session: SessionDep, 
    current_user: CurrentUser, 
    external_invoice_id: int, 
    external_invoice_in: ExternalInvoiceUpdate
) -> Any:
    """
    Update an existing external invoice.
    """
    external_invoice = external_invoices_crud.get_external_invoice_db(session, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")
    return external_invoices_crud.update_external_invoice_db(session, external_invoice, external_invoice_in)

@router.delete("/{external_invoice_id}", response_model=ExternalInvoicePublic)
def delete_external_invoice(
    session: SessionDep, current_user: CurrentUser, external_invoice_id: int
) -> Any:
    """
    Delete external invoice.
    """
    external_invoice = external_invoices_crud.get_external_invoice_db(session, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")
    return external_invoices_crud.delete_external_invoice_db(session, external_invoice)

@router.get("/{external_invoice_id}/parts", response_model=PartsPublic)
def read_external_invoice_parts(
    session: SessionDep, current_user: CurrentUser, external_invoice_id: int
) -> Any:
    """
    Retrieve parts for a specific external invoice.
    """
    external_invoice = external_invoices_crud.get_external_invoice_db(session, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")
    parts = external_invoices_crud.get_external_invoice_parts_db(session, external_invoice_id)
    return PartsPublic(data=parts, count=len(parts))

@router.get("/{external_invoice_id}/parts/{part_id}", response_model=PartPublic)
def read_external_invoice_part_by_invoice(
    session: SessionDep,
    current_user: CurrentUser,
    external_invoice_id: int,
    part_id: int,
) -> Any:
    """
    Get part by ID for a specific external invoice.
    """
    external_invoice = external_invoices_crud.get_external_invoice_db(session, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")

    part = external_invoices_crud.get_external_invoice_part_db(session, external_invoice_id, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found for this external invoice")

    return part

@router.get("/{external_invoice_id}/payments", response_model=PaymentToSuppliersPublic)
def read_payments_for_external_invoice(
    session: SessionDep, 
    current_user: CurrentUser, 
    external_invoice_id: int
) -> Any:
    """
    Retrieve all payments to suppliers for a specific external invoice.
    """
    external_invoice = external_invoices_crud.get_external_invoice_db(session, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")

    payments = external_invoices_crud.get_external_invoice_payments_db(session, external_invoice_id)
    return PaymentToSuppliersPublic(data=payments, count=len(payments))

@router.post("/process_invoice", response_model=InvoiceProcessingResponse)
def process_external_invoices(
    session: SessionDep, 
    current_user: CurrentUser,
    files: List[UploadFile] = File(...)
) -> InvoiceProcessingResponse:
    """
    Process external invoices and extract relevant information.
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