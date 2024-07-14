# app/crud/parts.py

from sqlmodel import Session, select, func
from typing import List, Optional
from decimal import Decimal, ROUND_HALF_UP

from app.models import Part, PartCreate, PartUpdate, ExternalInvoice

def create_part_db(session: Session, part_in: PartCreate) -> Part:
    external_invoice = session.get(ExternalInvoice, part_in.external_invoice_id)
    if not external_invoice:
        raise ValueError("External invoice not found")

    part_data = part_in.model_dump()
    part_data["project_id"] = part_in.project_id or external_invoice.project_id
    part_data["supplier_id"] = part_in.supplier_id or external_invoice.supplier_id
    part_data["amount"] = part_data["unit_price"] * part_data["quantity"]

    part = Part.model_validate(part_data)
    session.add(part)
    session.commit()
    session.refresh(part)
    return part

def update_part_db(session: Session, part: Part, part_in: PartUpdate) -> Part:
    if part_in.external_invoice_id is not None:
        external_invoice = session.get(ExternalInvoice, part_in.external_invoice_id)
        if not external_invoice:
            raise ValueError("External invoice not found")
        
        part.project_id = part_in.project_id or external_invoice.project_id
        part.supplier_id = part_in.supplier_id or external_invoice.supplier_id

    part_data = part_in.model_dump(exclude_unset=True)
    for key, value in part_data.items():
        setattr(part, key, value)

    quantity = Decimal(str(part.quantity))
    unit_price = Decimal(str(part.unit_price))
    part.amount = (quantity * unit_price).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    session.add(part)
    session.commit()
    session.refresh(part)
    return part

def get_parts_db(session: Session, skip: int = 0, limit: int = 100) -> List[Part]:
    return session.exec(select(Part).offset(skip).limit(limit)).all()

def get_parts_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(Part)).one()

def get_part_db(session: Session, part_id: int) -> Optional[Part]:
    return session.get(Part, part_id)

def delete_part_db(session: Session, part: Part) -> None:
    session.delete(part)
    session.commit()