from sqlmodel import Field, Relationship, SQLModel
from pydantic import BaseModel
from typing import List, Dict, Any
##### EXISTING CODE #####
# Shared properties
# TO DO replace email str with EmailStr when sqlmodel supports it

# --- user models ----
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = None
# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
# TODO replace email str with EmailStr when sqlmodel supports it
class UserRegister(SQLModel):
    email: str
    password: str
    full_name: str | None = None
# Properties to receive via API on update, all are optional
# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdate(UserBase):
    email: str | None = None  # type: ignore
    password: str | None = None
# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdateMe(SQLModel):
    full_name: str | None = None
    email: str | None = None
class UpdatePassword(SQLModel):
    current_password: str
    new_password: str
# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner")
# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: int
class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int

 


# --- item models ----
# Shared properties
class ItemBase(SQLModel):
    title: str
    description: str | None = None
# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str
# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = None  # type: ignore
# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="items")
# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: int
    owner_id: int
class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int
# Generic message
class Message(SQLModel):
    message: str
# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
# Contents of JWT token
class TokenPayload(SQLModel):
    sub: int | None = None
class NewPassword(SQLModel):
    token: str
    new_password: str





##### NEW CODE #####




from typing import Optional, List
from datetime import date
from enum import Enum

class CurrencyType(str, Enum):
    MAD = "MAD"
    EUR = "EUR"
class PaymentMode(str, Enum):
    Cash = "Cash"
    Bank_Transfer = "Bank Transfer"
    Check = "Check"
    Credit = "Credit"
class PaymentStatus(str, Enum):
    Paid = "Paid"
    Pending = "Pending"
    Partial = "Partial"
    Failed = "Failed"
    Missing = "Missing"



# --- supplier models ----
# Shared properties
class SupplierBase(SQLModel):
    name: str
    ice: str
    postal_code: Optional[str] = None
    rib: Optional[str] = None

class SupplierCreate(SupplierBase):
    name: str
    ice: str
    postal_code: Optional[str] = None

class SupplierUpdate(SupplierBase):
    name: Optional[str] = None
    ice: Optional[str] = None
    postal_code: Optional[str] = None
    rib: Optional[str] = None

class Supplier(SupplierBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contacts: List["SupplierContact"] = Relationship(back_populates="supplier", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    external_invoices: List["ExternalInvoice"] = Relationship(back_populates="supplier", sa_relationship_kwargs={"cascade": "all, delete-orphan"}) 
    payments_to_suppliers: List["PaymentToSupplier"] = Relationship(back_populates="supplier") 
    parts: List["Part"] = Relationship(back_populates="supplier")

class SupplierPublic(SupplierBase):
    id: int

class SuppliersPublic(SQLModel):
    data: List[SupplierPublic]
    count: int



# --- supplier contact models ---
class SupplierContactBase(SQLModel):
    contact_name: str
    phone_number: str | None = None
    email: str | None = None
    address: str | None = None
    bank_details: str | None = None
class SupplierContactCreate(SupplierContactBase):
    contact_name: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    bank_details: Optional[str] = None
    supplier_id: int
class SupplierContactUpdate(SupplierContactBase):
    contact_name: Optional[str] = None 
    supplier_id: int
class SupplierContact(SupplierContactBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    supplier_id: int = Field(foreign_key="supplier.id")
    supplier: "Supplier" = Relationship(back_populates="contacts")
class SupplierContactPublic(SupplierContactBase):
    id: int
    supplier_id: int
class SupplierContactsPublic(SQLModel):
    data: List[SupplierContactPublic]
    count: int






#--- Project Models ---
class ProjectBase(SQLModel):
    name: str
    description: Optional[str] = None
class ProjectCreate(ProjectBase):
    pass 
class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    description: Optional[str] = None
class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    parts: List["Part"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    internal_invoices: List["InternalInvoice"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    external_invoices: List["ExternalInvoice"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    payments_to_suppliers: List["PaymentToSupplier"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    payments_from_customers: List["PaymentFromCustomer"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
class ProjectPublic(ProjectBase):
    id: int 
class ProjectsPublic(SQLModel):
    data: List[ProjectPublic]
    count: int






# Customer Models
class CustomerBase(SQLModel):
    name: str
    ice: str
    postal_code: str
    rib: Optional[str] = None
class CustomerCreate(CustomerBase):
    name: str
    ice: str
    postal_code: str
class CustomerUpdate(CustomerBase):
    name: Optional[str] = None
    ice: Optional[str] = None
    postal_code: Optional[str] = None
    rib: Optional[str] = None
class Customer(CustomerBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    contacts: List["CustomerContact"] = Relationship(back_populates="customer", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    internal_invoices: List["InternalInvoice"] = Relationship(back_populates="customer", sa_relationship_kwargs={"cascade": "all, delete-orphan"}) 
    payments_from_customers: List["PaymentFromCustomer"] = Relationship(back_populates="customer") 
class CustomerPublic(CustomerBase):
    id: int 
    name: str
class CustomersPublic(SQLModel):
    data: List[CustomerPublic]
    count: int

# --- Customer Contact Models ---
class CustomerContactBase(SQLModel):
    contact_name: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    bank_details: Optional[str] = None
class CustomerContactCreate(CustomerContactBase):
    contact_name: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    bank_details: Optional[str] = None 
    customer_id: int
class CustomerContactUpdate(CustomerContactBase):
    contact_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    bank_details: Optional[str] = None
    customer_id: int 
class CustomerContact(CustomerContactBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id")
    customer: "Customer" = Relationship(back_populates="contacts")
class CustomerContactPublic(CustomerContactBase):
    id: int 
    customer_id: int
class CustomerContactsPublic(SQLModel):
    data: List[CustomerContactPublic]
    count: int






# ---
# Invoice Models
# ---
# --- ExternalInvoices ----
# ---
# --- ExternalInvoice models ----
class ExternalInvoiceBase(SQLModel):
    reference: str
    invoice_date: date
    due_date: date
    amount_ttc: float
    amount_ht: float
    vat: Optional[float] = None
    currency_type: CurrencyType 
class ExternalInvoiceCreate(ExternalInvoiceBase):
    supplier_id: int
    project_id: int
    reference: str
    invoice_date: date
    due_date: date
    amount_ttc: float
    amount_ht: float
    vat: Optional[float] = None
    currency_type: CurrencyType 
class ExternalInvoiceUpdate(ExternalInvoiceBase):
    supplier_id: Optional[int] = None
    project_id: Optional[int] = None
    reference: Optional[str] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    amount_ttc: Optional[float] = None
    amount_ht: Optional[float] = None
    vat: Optional[float] = None
    currency_type: Optional[CurrencyType] = None
class ExternalInvoice(ExternalInvoiceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    supplier_id: int = Field(foreign_key="supplier.id")
    project_id: int = Field(foreign_key="project.id")
    supplier: "Supplier" = Relationship(back_populates="external_invoices")
    project: "Project" = Relationship(back_populates="external_invoices")
    payments_to_suppliers: List["PaymentToSupplier"] = Relationship(back_populates="external_invoice", sa_relationship_kwargs={"cascade": "all, delete-orphan"}) 
    parts: List["Part"] = Relationship(back_populates="external_invoice", sa_relationship_kwargs={"cascade": "all, delete-orphan"})  
class ExternalInvoicePublic(ExternalInvoiceBase):
    id: int
    supplier_id: int
    project_id: int
class ExternalInvoicesPublic(SQLModel):
    data: List[ExternalInvoicePublic]
    count: int

class InvoiceProcessingResponse(BaseModel):
    data: List[Dict[str, Any]]
# ---





# ---
# --- InternalInvoices ----

class InternalInvoiceBase(SQLModel):
    reference: str
    invoice_date: date
    due_date: date
    amount_ttc: float
    amount_ht: float
    vat: Optional[float] = None
    currency_type: CurrencyType
class InternalInvoiceCreate(InternalInvoiceBase):
    customer_id: int
    project_id: int
    reference: str
    invoice_date: date
    due_date: date
    amount_ttc: float
    amount_ht: float
    vat: Optional[float] = None
    currency_type: CurrencyType
class InternalInvoiceUpdate(InternalInvoiceBase):
    customer_id: Optional[int] = None
    project_id: Optional[int] = None
    reference: Optional[str] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    amount_ttc: Optional[float] = None
    amount_ht: Optional[float] = None
    vat: Optional[float] = None
    currency_type: Optional[CurrencyType] = None
class InternalInvoice(InternalInvoiceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id")
    project_id: int = Field(foreign_key="project.id")
    customer: "Customer" = Relationship(back_populates="internal_invoices")
    project: "Project" = Relationship(back_populates="internal_invoices")
    payments_from_customers: List["PaymentFromCustomer"] = Relationship(back_populates="internal_invoice", sa_relationship_kwargs={"cascade": "all, delete-orphan"}) 
    # no parts relationship (internal invoices do not have parts
class InternalInvoicePublic(InternalInvoiceBase):
    id: int
    customer_id: int
    project_id: int
class InternalInvoicesPublic(SQLModel):
    data: List[InternalInvoicePublic]
    count: int





class PartBase(SQLModel):
    item_code: str
    description: Optional[str] = None
    quantity: int = Field(default=1)
    unit_price: float
class PartCreate(SQLModel):
    item_code: str
    description: Optional[str] = None
    quantity: int = Field(default=1)
    unit_price: float
    external_invoice_id: int
    supplier_id: Optional[int] = None
    project_id: Optional[int] = None  
class PartUpdate(SQLModel):
    item_code: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    external_invoice_id: Optional[int] = None
    supplier_id: Optional[int] = None
    project_id: Optional[int] = None 
class Part(PartBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    amount: float = Field(default=0.0)  # Amount is calculated
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    external_invoice_id: Optional[int] = Field(default=None, foreign_key="externalinvoice.id")
    supplier_id: Optional[int] = Field(default=None, foreign_key="supplier.id")
    project: Optional["Project"] = Relationship(back_populates="parts")
    external_invoice: Optional["ExternalInvoice"] = Relationship(back_populates="parts")
    supplier: Optional["Supplier"] = Relationship(back_populates="parts")
class PartPublic(PartBase):
    id: int
    amount: float
    project_id: Optional[int]
    external_invoice_id: Optional[int]
    supplier_id: Optional[int]
class PartsPublic(SQLModel):
    data: List[PartPublic]
    count: int








# Payment Models
# External to supplier Payments models

class PaymentToSupplierBase(SQLModel):
    payment_status: PaymentStatus
    payment_mode: PaymentMode
    amount: Optional[float] = None
    remaining: Optional[float] = None
    disbursement_date: date
    payment_ref: str
    additional_fees: Optional[float] = None
class PaymentToSupplierCreate(PaymentToSupplierBase):
    external_invoice_id: int
class PaymentToSupplierUpdate(PaymentToSupplierBase):
    external_invoice_id: Optional[int] = None
    payment_status: Optional[PaymentStatus] = None
    payment_mode: Optional[PaymentMode] = None
    amount: Optional[float] = None
    remaining: Optional[float] = None
    disbursement_date: Optional[date] = None
    payment_ref: Optional[str] = None
    additional_fees: Optional[float] = None
class PaymentToSupplier(PaymentToSupplierBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    external_invoice_id: int = Field(foreign_key="externalinvoice.id")
    supplier_id: int = Field(foreign_key="supplier.id") 
    project_id: int = Field(foreign_key="project.id")
    external_invoice: "ExternalInvoice" = Relationship(back_populates="payments_to_suppliers")
    supplier: "Supplier" = Relationship(back_populates="payments_to_suppliers")  
    project: "Project" = Relationship(back_populates="payments_to_suppliers") 
class PaymentToSupplierPublic(PaymentToSupplierBase):
    id: int
    external_invoice_id: int
    supplier_id: int  
    project_id: int
class PaymentToSuppliersPublic(SQLModel):
    data: List[PaymentToSupplierPublic]
    count: int



# Internal from customer Payments models

class PaymentFromCustomerBase(SQLModel):
    payment_status: PaymentStatus
    payment_mode: PaymentMode
    amount: Optional[float] = None
    remaining: Optional[float] = None
    disbursement_date: date
    payment_ref: str
    additional_fees: Optional[float] = None
class PaymentFromCustomerCreate(PaymentFromCustomerBase):
    internal_invoice_id: int
class PaymentFromCustomerUpdate(PaymentFromCustomerBase):
    internal_invoice_id: Optional[int] = None
    payment_status: Optional[PaymentStatus] = None
    payment_mode: Optional[PaymentMode] = None
    amount: Optional[float] = None
    remaining: Optional[float] = None
    disbursement_date: Optional[date] = None
    payment_ref: Optional[str] = None
    additional_fees: Optional[float] = None
class PaymentFromCustomer(PaymentFromCustomerBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    internal_invoice_id: int = Field(foreign_key="internalinvoice.id")
    customer_id: int = Field(foreign_key="customer.id")
    project_id: int = Field(foreign_key="project.id")
    internal_invoice: "InternalInvoice" = Relationship(back_populates="payments_from_customers")
    customer: "Customer" = Relationship(back_populates="payments_from_customers")
    project: "Project" = Relationship(back_populates="payments_from_customers")
class PaymentFromCustomerPublic(PaymentFromCustomerBase):
    id: int
    internal_invoice_id: int
    customer_id: int
    project_id: int
class PaymentFromCustomersPublic(SQLModel):
    data: List[PaymentFromCustomerPublic]
    count: int
