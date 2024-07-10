from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Supplier,
    SupplierCreate, 
    SupplierPublic, 
    SuppliersPublic, 
    SupplierUpdate
    )
from app.models import (
    SupplierContact, 
    SupplierContactCreate, 
    SupplierContactPublic, 
    SupplierContactsPublic, 
    SupplierContactUpdate
                        )
from app.models import ExternalInvoicesPublic, PaymentToSuppliersPublic
from app.models import Part, ExternalInvoice, PartsPublic

router = APIRouter()

# --- Supplier Endpoints ---
@router.get("/", response_model=SuppliersPublic)
def read_suppliers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve suppliers.
    """
    count_statement = select(func.count()).select_from(Supplier)
    count = session.exec(count_statement).one()
    statement = select(Supplier).offset(skip).limit(limit)
    suppliers = session.exec(statement).all()

    return SuppliersPublic(data=suppliers, count=count)

@router.get("/contacts", response_model=SupplierContactsPublic)
def read_all_supplier_contacts(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all supplier contacts.
    """
    count_statement = select(func.count()).select_from(SupplierContact)
    count = session.exec(count_statement).one()
    statement = select(SupplierContact).offset(skip).limit(limit)
    contacts = session.exec(statement).all()

    return SupplierContactsPublic(data=contacts, count=count)

@router.get("/{supplier_id}", response_model=SupplierPublic)
def read_supplier(session: SessionDep, current_user: CurrentUser, supplier_id: int) -> Any:
    """
    Get supplier by ID.
    """
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.post("/", response_model=SupplierPublic)
def create_supplier(
    *, session: SessionDep, current_user: CurrentUser, supplier_in: SupplierCreate
) -> Any:
    """
    Create new supplier.
    """
    supplier = Supplier.from_orm(supplier_in)
    session.add(supplier)
    session.commit()
    session.refresh(supplier)
    return supplier

@router.put("/{supplier_id}", response_model=SupplierPublic)
def update_supplier(
    *, session: SessionDep, current_user: CurrentUser, supplier_id: int, supplier_in: SupplierUpdate
) -> Any:
    """
    Update an existing supplier.
    """
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    supplier_data = supplier_in.dict(exclude_unset=True)
    for key, value in supplier_data.items():
        setattr(supplier, key, value)
    session.add(supplier)
    session.commit()
    session.refresh(supplier)
    return supplier

@router.delete("/{supplier_id}", response_model=SupplierPublic)
def delete_supplier(session: SessionDep, current_user: CurrentUser, supplier_id: int) -> Any:
    """
    Delete supplier.
    """
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    session.delete(supplier)
    session.commit()
    return supplier

# --- Supplier Contact Endpoints ---

@router.get("/{supplier_id}/contacts", response_model=SupplierContactsPublic)
def read_supplier_contacts(
    session: SessionDep, current_user: CurrentUser, supplier_id: int
) -> Any:
    """
    Retrieve supplier contacts.
    """
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierContactsPublic(data=supplier.contacts, count=len(supplier.contacts))

@router.get("/contacts/{contact_id}", response_model=SupplierContactPublic)
def read_contact(
    session: SessionDep, current_user: CurrentUser, contact_id: int
) -> Any:
    """
    Read contact by contact ID.
    """
    contact = session.get(SupplierContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Supplier contact not found")
    return contact

@router.get("/{supplier_id}/contacts/{contact_id}", response_model=SupplierContactPublic)
def read_supplier_contact(
    session: SessionDep,
    current_user: CurrentUser,
    supplier_id: int,
    contact_id: int,
) -> Any:
    """Get contact by supplier ID and contact ID."""
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    contact = (
        session.query(SupplierContact)
        .filter(
            SupplierContact.id == contact_id,
            SupplierContact.supplier_id == supplier_id,
        )
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=404, detail="Supplier contact not found for this supplier"
        )

    return SupplierContactPublic.from_orm(contact)

@router.post("/{supplier_id}/contacts", response_model=SupplierContactPublic)
def create_supplier_contact(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    contact_in: SupplierContactCreate,
) -> Any:
    """Create new supplier contact."""
    supplier = session.get(Supplier, contact_in.supplier_id)  # Use supplier_id from contact_in
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    contact = SupplierContact(**contact_in.dict())
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

@router.put("/contacts/{contact_id}", response_model=SupplierContactPublic)
def update_supplier_contact(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    contact_id: int,
    contact_in: SupplierContactUpdate,
) -> Any:
    """Update supplier contact."""
    contact = session.get(SupplierContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Supplier contact not found")
    
    if contact.supplier_id != contact_in.supplier_id:
        raise HTTPException(status_code=400, detail="Supplier ID mismatch")

    contact_data = contact_in.dict(exclude_unset=True)
    for key, value in contact_data.items():
        setattr(contact, key, value)

    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

@router.delete("/contacts/{contact_id}", response_model=SupplierContactPublic)
def delete_supplier_contact(
    *,
    session: SessionDep, 
    current_user: CurrentUser, 
    contact_id: int
) -> Any:
    """
    Delete supplier contact.
    """
    contact = session.get(SupplierContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Supplier contact not found")

    session.delete(contact)
    session.commit()

    return contact




# --- Supplier invoices Endpoints ---

@router.get("/{supplier_id}/externalinvoices", response_model=ExternalInvoicesPublic)
def read_external_invoices_for_supplier(
    session: SessionDep, 
    current_user: CurrentUser, 
    supplier_id: int
) -> Any:
    """
    Retrieve all external invoices for a specific supplier.
    """
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="No Invoices found for this Supplier ID")

    invoices = supplier.external_invoices
    return ExternalInvoicesPublic(data=invoices, count=len(invoices))

# --- Supplier payments Endpoints ---

@router.get("/{supplier_id}/payments", response_model=PaymentToSuppliersPublic)
def read_payments_to_supplier(
    session: SessionDep, 
    current_user: CurrentUser, 
    supplier_id: int
) -> Any:
    """
    Retrieve all payments to a specific supplier.
    """
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    # Retrieve payments directly using the relationship
    payments = supplier.payments_to_suppliers

    return PaymentToSuppliersPublic(data=payments, count=len(payments))



@router.get("/{supplier_id}/parts", response_model=PartsPublic)
def read_parts_by_supplier(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    supplier_id: int,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all parts bought from a specific supplier.
    """
    supplier = session.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    statement = (
        select(Part)
        .where(Part.supplier_id == supplier_id)
        .offset(skip)
        .limit(limit)
    )

    parts = session.exec(statement).all()
    
    count_statement = (
        select(func.count(Part.id))
        .where(Part.supplier_id == supplier_id)
    )
    count = session.exec(count_statement).one()

    return PartsPublic(data=parts, count=count)