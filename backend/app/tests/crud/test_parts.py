from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from app.crud.parts import (
    create_part_db,
    get_part_db,
    update_part_db,
    delete_part_db
)
from app.models import Part, PartCreate, PartUpdate, Supplier, Project, ExternalInvoice
from app.tests.utils.utils import random_lower_string, random_float, random_int

def test_create_part(db: Session, supplier: Supplier, project: Project, external_invoice: ExternalInvoice) -> None:
    item_code = random_lower_string()
    description = random_lower_string()
    quantity = random_int()
    unit_price = random_float()
    part_in = PartCreate(
        item_code=item_code,
        description=description,
        quantity=quantity,
        unit_price=unit_price,
        external_invoice_id=external_invoice.id,
        project_id=project.id,
        supplier_id=supplier.id
    )
    part = create_part_db(session=db, part_in=part_in)
    assert part.item_code == item_code
    assert part.description == description
    assert part.quantity == quantity
    assert part.unit_price == unit_price

def test_get_part(db: Session, supplier: Supplier, project: Project, external_invoice: ExternalInvoice) -> None:
    item_code = random_lower_string()
    description = random_lower_string()
    quantity = random_int()
    unit_price = random_float()
    part_in = PartCreate(
        item_code=item_code,
        description=description,
        quantity=quantity,
        unit_price=unit_price,
        external_invoice_id=external_invoice.id,
        project_id=project.id,
        supplier_id=supplier.id
    )
    part = create_part_db(session=db, part_in=part_in)
    stored_part = get_part_db(session=db, part_id=part.id)
    assert stored_part
    assert part.id == stored_part.id
    assert jsonable_encoder(part) == jsonable_encoder(stored_part)

def test_update_part(db: Session, supplier: Supplier, project: Project, external_invoice: ExternalInvoice) -> None:
    item_code = random_lower_string()
    description = random_lower_string()
    quantity = random_int()
    unit_price = random_float()
    part_in = PartCreate(
        item_code=item_code,
        description=description,
        quantity=quantity,
        unit_price=unit_price,
        external_invoice_id=external_invoice.id,
        project_id=project.id,
        supplier_id=supplier.id
    )
    part = create_part_db(session=db, part_in=part_in)
    new_quantity = random_int()
    part_update = PartUpdate(quantity=new_quantity)
    updated_part = update_part_db(session=db, part=part, part_in=part_update)
    assert updated_part.id == part.id
    assert updated_part.quantity == new_quantity
    assert updated_part.item_code == item_code

def test_delete_part(db: Session, supplier: Supplier, project: Project, external_invoice: ExternalInvoice) -> None:
    item_code = random_lower_string()
    description = random_lower_string()
    quantity = random_int()
    unit_price = random_float()
    part_in = PartCreate(
        item_code=item_code,
        description=description,
        quantity=quantity,
        unit_price=unit_price,
        external_invoice_id=external_invoice.id,
        project_id=project.id,
        supplier_id=supplier.id
    )
    part = create_part_db(session=db, part_in=part_in)
    delete_part_db(session=db, part=part)
    db.commit()  # Ensure changes are committed to the DB
    stored_part = get_part_db(session=db, part_id=part.id)
    assert stored_part is None
