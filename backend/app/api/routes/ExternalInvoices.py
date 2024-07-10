from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlmodel import select, func
from typing import Any, List

from app.api.deps import CurrentUser, SessionDep
from app.api import gpt_process
from app.models import ExternalInvoice, ExternalInvoiceCreate, ExternalInvoicePublic, ExternalInvoicesPublic, ExternalInvoiceUpdate
from app.models import Part, PartPublic, PartsPublic
from app.models import Supplier, Project
from app.models import PaymentToSuppliersPublic
from app.models import InvoiceProcessingResponse

router = APIRouter()

@router.get("/", response_model=ExternalInvoicesPublic)
def read_external_invoices(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve external invoices.
    """
    count_statement = select(func.count()).select_from(ExternalInvoice)
    count = session.exec(count_statement).one()
    statement = select(ExternalInvoice).offset(skip).limit(limit)
    external_invoices = session.exec(statement).all()
    return ExternalInvoicesPublic(data=external_invoices, count=count)

@router.get("/{external_invoice_id}", response_model=ExternalInvoicePublic)
def read_external_invoice(
    session: SessionDep, current_user: CurrentUser, external_invoice_id: int
) -> Any:
    """
    Get external invoice by ID.
    """
    external_invoice = session.get(ExternalInvoice, external_invoice_id)
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

    # Check if supplier exists
    supplier = session.get(Supplier, external_invoice_in.supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    # Check if project exists
    project = session.get(Project, external_invoice_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Calculate VAT
    vat = round(external_invoice_in.amount_ttc - external_invoice_in.amount_ht, 2)

    # Create the invoice with the calculated VAT
    external_invoice = ExternalInvoice(
        reference=external_invoice_in.reference,
        invoice_date=external_invoice_in.invoice_date,
        due_date=external_invoice_in.due_date,
        amount_ttc=external_invoice_in.amount_ttc,
        amount_ht=external_invoice_in.amount_ht,
        vat=vat,
        currency_type=external_invoice_in.currency_type,
        supplier_id=external_invoice_in.supplier_id,
        project_id=external_invoice_in.project_id
    )

    session.add(external_invoice)
    session.commit()
    session.refresh(external_invoice)
    return external_invoice


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
    external_invoice = session.get(ExternalInvoice, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")
    external_invoice_data = external_invoice_in.dict(exclude_unset=True)
    for key, value in external_invoice_data.items():
        setattr(external_invoice, key, value)
    session.add(external_invoice)
    session.commit()
    session.refresh(external_invoice)
    return external_invoice

@router.delete("/{external_invoice_id}", response_model=ExternalInvoicePublic)
def delete_external_invoice(
    session: SessionDep, current_user: CurrentUser, external_invoice_id: int
) -> Any:
    """
    Delete external invoice.
    """
    external_invoice = session.get(ExternalInvoice, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")
    session.delete(external_invoice)
    session.commit()
    return external_invoice



# --- External Invoice Item Endpoints ---
@router.get("/{external_invoice_id}/parts", response_model=PartsPublic)
def read_external_invoice_parts(
    session: SessionDep, current_user: CurrentUser, external_invoice_id: int
) -> Any:
    """
    Retrieve parts for a specific external invoice.
    """
    external_invoice = session.get(ExternalInvoice, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")
    return PartsPublic(data=external_invoice.parts, count=len(external_invoice.parts))

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
    external_invoice = session.get(ExternalInvoice, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")

    part = (
        session.query(Part)
        .filter(
            Part.id == part_id,
            Part.external_invoice_id == external_invoice_id,
        )
        .first()
    )

    if not part:
        raise HTTPException(
            status_code=404, detail="Part not found for this external invoice"
        )

    return part




# --- payment to supplier ---
@router.get("/{external_invoice_id}/payments", response_model=PaymentToSuppliersPublic)
def read_payments_for_external_invoice(
    session: SessionDep, 
    current_user: CurrentUser, 
    external_invoice_id: int
) -> Any:
    """
    Retrieve all payments to suppliers for a specific external invoice.
    """
    external_invoice = session.get(ExternalInvoice, external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")

    payments = external_invoice.payments_to_suppliers 
    return PaymentToSuppliersPublic(data=payments, count=len(payments))








# --- AI invoice process endpoints --- 
# --- Process External Invoice into openai pipeline---

@router.post("/process_invoice", response_model=InvoiceProcessingResponse)
def process_external_invoices(
    session: SessionDep, 
    current_user: CurrentUser, 
    files: List[UploadFile] = File(...)
) -> InvoiceProcessingResponse :
    """
    Process external invoices and extract relevant information.
    """
    try:
        results = gpt_process.pipeline(files, debug=True)
        return InvoiceProcessingResponse(data=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
