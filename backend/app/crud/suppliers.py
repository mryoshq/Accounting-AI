# app/crud/suppliers.py

from sqlmodel import Session, select, func
from typing import List, Optional, Any

from app.models import (
    Supplier,
    SupplierCreate,
    SupplierUpdate,
    SupplierContact,
    SupplierContactCreate,
    SupplierContactUpdate,
    Part,
    ExternalInvoice
)

def create_supplier_db(session: Session, supplier_in: SupplierCreate) -> Supplier:
    supplier = Supplier.model_validate(supplier_in)
    session.add(supplier)
    session.commit()
    session.refresh(supplier)
    return supplier

def get_supplier_db(session: Session, supplier_id: int) -> Optional[Supplier]:
    return session.get(Supplier, supplier_id)

def get_suppliers_db(session: Session, skip: int = 0, limit: int = 100) -> List[Supplier]:
    return session.exec(select(Supplier).offset(skip).limit(limit)).all()

def get_suppliers_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(Supplier)).one()

def update_supplier_db(session: Session, supplier: Supplier, supplier_in: SupplierUpdate) -> Supplier:
    supplier_data = supplier_in.model_dump(exclude_unset=True)
    for key, value in supplier_data.items():
        setattr(supplier, key, value)
    session.add(supplier)
    session.commit()
    session.refresh(supplier)
    return supplier

def delete_supplier_db(session: Session, supplier: Supplier) -> Supplier:
    session.delete(supplier)
    session.commit()
    return supplier

def get_supplier_contacts_db(session: Session, supplier_id: int) -> List[SupplierContact]:
    supplier = session.get(Supplier, supplier_id)
    return supplier.contacts if supplier else []

def get_supplier_contacts_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(SupplierContact)).one()

def get_all_supplier_contacts_db(session: Session, skip: int = 0, limit: int = 100) -> List[SupplierContact]:
    return session.exec(select(SupplierContact).offset(skip).limit(limit)).all()




def get_supplier_contact_db(session: Session, contact_id: int) -> Optional[SupplierContact]:
    return session.get(SupplierContact, contact_id)

def create_supplier_contact_db(session: Session, contact_in: SupplierContactCreate) -> SupplierContact:
    contact = SupplierContact.model_validate(contact_in)
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

def update_supplier_contact_db(session: Session, contact: SupplierContact, contact_in: SupplierContactUpdate) -> SupplierContact:
    contact_data = contact_in.model_dump(exclude_unset=True)
    for key, value in contact_data.items():
        setattr(contact, key, value)
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

def delete_supplier_contact_db(session: Session, contact: SupplierContact) -> SupplierContact:
    session.delete(contact)
    session.commit()
    return contact

def get_supplier_external_invoices_db(session: Session, supplier_id: int) -> List[ExternalInvoice]:
    supplier = session.get(Supplier, supplier_id)
    return supplier.external_invoices if supplier else []

def get_supplier_payments_db(session: Session, supplier_id: int) -> List[Any]:
    supplier = session.get(Supplier, supplier_id)
    return supplier.payments_to_suppliers if supplier else []





# --
def get_supplier_parts_db(session: Session, supplier_id: int, skip: int = 0, limit: int = 100) -> List[Part]:
    return session.exec(select(Part).where(Part.supplier_id == supplier_id).offset(skip).limit(limit)).all()

def get_supplier_parts_count_db(session: Session, supplier_id: int) -> int:
    return session.exec(select(func.count(Part.id)).where(Part.supplier_id == supplier_id)).one()
# --