from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from typing import Any
from decimal import Decimal, ROUND_HALF_UP

from app.api.deps import CurrentUser, SessionDep
from app.models import ExternalInvoice, Part, PartCreate, PartUpdate, PartPublic, PartsPublic

router = APIRouter()

@router.post("/", response_model=PartPublic)
def create_part(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    part_in: PartCreate
) -> Any:
    """
    Create new part.
    """
    # Validate the external invoice
    external_invoice = session.get(ExternalInvoice, part_in.external_invoice_id)
    if not external_invoice:
        raise HTTPException(status_code=404, detail="External invoice not found")

    # Deduce project_id and supplier_id from external_invoice
    

    part_data = part_in.dict()

    part_data["project_id"] = part_in.project_id or external_invoice.project_id
    part_data["supplier_id"] = part_in.supplier_id or external_invoice.supplier_id

    part_data["amount"] = part_data["unit_price"] * part_data["quantity"]

    part = Part(**part_data)
    session.add(part)
    session.commit()
    session.refresh(part)
    return part

@router.patch("/{part_id}", response_model=PartPublic)
def update_part(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    part_id: int,
    part_in: PartUpdate
) -> Any:
    """
    Update an existing part.
    """
    part = session.get(Part, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    # Validate the external invoice if external_invoice_id is provided
    if part_in.external_invoice_id is not None:
        external_invoice = session.get(ExternalInvoice, part_in.external_invoice_id)
        if not external_invoice:
            raise HTTPException(status_code=404, detail="External invoice not found")
        
        # Use provided project_id and supplier_id if available, otherwise use from external_invoice
        part.project_id = part_in.project_id or external_invoice.project_id
        part.supplier_id = part_in.supplier_id or external_invoice.supplier_id

    part_data = part_in.dict(exclude_unset=True)
    for key, value in part_data.items():
        setattr(part, key, value)

    # Recalculate the amount
    quantity = Decimal(str(part.quantity))
    unit_price = Decimal(str(part.unit_price))
    part.amount = (quantity * unit_price).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


    session.add(part)
    session.commit()
    session.refresh(part)
    return part

@router.get("/", response_model=PartsPublic)
def read_parts(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve parts.
    """
    count_statement = select(func.count()).select_from(Part)
    count = session.exec(count_statement).one()
    statement = select(Part).offset(skip).limit(limit)
    parts = session.exec(statement).all()
    return PartsPublic(data=parts, count=count)

@router.get("/{part_id}", response_model=PartPublic)
def read_part(
    session: SessionDep,
    current_user: CurrentUser,
    part_id: int
) -> Any:
    """
    Get part by ID.
    """
    part = session.get(Part, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part

@router.delete("/{part_id}")
def delete_part(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    part_id: int
) -> Any:
    """
    Delete a part.
    """
    part = session.get(Part, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    session.delete(part)
    session.commit()
    return {"message": "Part deleted successfully"}






