# app/api/routes/suppliers.py

from typing import Any
from fastapi import APIRouter, HTTPException
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    SupplierCreate, 
    SupplierPublic, 
    SuppliersPublic, 
    SupplierUpdate,
    SupplierContactCreate, 
    SupplierContactPublic, 
    SupplierContactsPublic, 
    SupplierContactUpdate,
    ExternalInvoicesPublic,
    PaymentToSuppliersPublic,
    PartsPublic
)
from app.crud import suppliers as suppliers_crud

router = APIRouter()

@router.get("/", response_model=SuppliersPublic)
def read_suppliers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve suppliers.
    """
    suppliers = suppliers_crud.get_suppliers_db(session, skip=skip, limit=limit)
    count = suppliers_crud.get_suppliers_count_db(session)
    return SuppliersPublic(data=suppliers, count=count)

@router.get("/contacts", response_model=SupplierContactsPublic)
def read_all_supplier_contacts(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all supplier contacts.
    """
    contacts = suppliers_crud.get_all_supplier_contacts_db(session, skip=skip, limit=limit)
    count = suppliers_crud.get_supplier_contacts_count_db(session)
    return SupplierContactsPublic(data=contacts, count=count)

@router.get("/{supplier_id}", response_model=SupplierPublic)
def read_supplier(session: SessionDep, current_user: CurrentUser, supplier_id: int) -> Any:
    """
    Get supplier by ID.
    """
    supplier = suppliers_crud.get_supplier_db(session, supplier_id)
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
    return suppliers_crud.create_supplier_db(session, supplier_in)

@router.put("/{supplier_id}", response_model=SupplierPublic)
def update_supplier(
    *, session: SessionDep, current_user: CurrentUser, supplier_id: int, supplier_in: SupplierUpdate
) -> Any:
    """
    Update an existing supplier.
    """
    supplier = suppliers_crud.get_supplier_db(session, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return suppliers_crud.update_supplier_db(session, supplier, supplier_in)

@router.delete("/{supplier_id}", response_model=SupplierPublic)
def delete_supplier(session: SessionDep, current_user: CurrentUser, supplier_id: int) -> Any:
    """
    Delete supplier.
    """
    supplier = suppliers_crud.get_supplier_db(session, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return suppliers_crud.delete_supplier_db(session, supplier)

@router.get("/{supplier_id}/contacts", response_model=SupplierContactsPublic)
def read_supplier_contacts(
    session: SessionDep, current_user: CurrentUser, supplier_id: int
) -> Any:
    """
    Retrieve supplier contacts.
    """
    supplier = suppliers_crud.get_supplier_db(session, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    contacts = suppliers_crud.get_supplier_contacts_db(session, supplier_id)
    return SupplierContactsPublic(data=contacts, count=len(contacts))

@router.get("/contacts/{contact_id}", response_model=SupplierContactPublic)
def read_contact(
    session: SessionDep, current_user: CurrentUser, contact_id: int
) -> Any:
    """
    Read contact by contact ID.
    """
    contact = suppliers_crud.get_supplier_contact_db(session, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Supplier contact not found")
    return contact

@router.post("/{supplier_id}/contacts", response_model=SupplierContactPublic)
def create_supplier_contact(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    contact_in: SupplierContactCreate,
) -> Any:
    """Create new supplier contact."""
    supplier = suppliers_crud.get_supplier_db(session, contact_in.supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return suppliers_crud.create_supplier_contact_db(session, contact_in)

@router.put("/contacts/{contact_id}", response_model=SupplierContactPublic)
def update_supplier_contact(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    contact_id: int,
    contact_in: SupplierContactUpdate,
) -> Any:
    """Update supplier contact."""
    contact = suppliers_crud.get_supplier_contact_db(session, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Supplier contact not found")
    if contact.supplier_id != contact_in.supplier_id:
        raise HTTPException(status_code=400, detail="Supplier ID mismatch")
    return suppliers_crud.update_supplier_contact_db(session, contact, contact_in)

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
    contact = suppliers_crud.get_supplier_contact_db(session, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Supplier contact not found")
    return suppliers_crud.delete_supplier_contact_db(session, contact)

@router.get("/{supplier_id}/externalinvoices", response_model=ExternalInvoicesPublic)
def read_external_invoices_for_supplier(
    session: SessionDep, 
    current_user: CurrentUser, 
    supplier_id: int
) -> Any:
    """
    Retrieve all external invoices for a specific supplier.
    """
    supplier = suppliers_crud.get_supplier_db(session, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="No Invoices found for this Supplier ID")
    invoices = suppliers_crud.get_supplier_external_invoices_db(session, supplier_id)
    return ExternalInvoicesPublic(data=invoices, count=len(invoices))

@router.get("/{supplier_id}/payments", response_model=PaymentToSuppliersPublic)
def read_payments_to_supplier(
    session: SessionDep, 
    current_user: CurrentUser, 
    supplier_id: int
) -> Any:
    """
    Retrieve all payments to a specific supplier.
    """
    supplier = suppliers_crud.get_supplier_db(session, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    payments = suppliers_crud.get_supplier_payments_db(session, supplier_id)
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
    supplier = suppliers_crud.get_supplier_db(session, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    parts = suppliers_crud.get_supplier_parts_db(session, supplier_id, skip=skip, limit=limit)
    count = suppliers_crud.get_supplier_parts_count_db(session, supplier_id)
    return PartsPublic(data=parts, count=count)