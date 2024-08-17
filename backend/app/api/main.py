from app.api.routes import utils
from fastapi import APIRouter

from app.api.routes import login, users
from app.api.routes import projects
from app.api.routes import suppliers, customers
from app.api.routes import parts
from app.api.routes import ExternalInvoices, InternalInvoices
from app.api.routes import paymentstosupplier, paymentsfromcustomer
from app.api.routes import reporting

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
api_router.include_router(ExternalInvoices.router, prefix="/external_invoices", tags=["external_invoices"])
api_router.include_router(InternalInvoices.router, prefix="/internal_invoices", tags=["internal_invoices"])
api_router.include_router(paymentstosupplier.router, prefix="/paymentstosupplier", tags=["paymentstosupplier"])
api_router.include_router(paymentsfromcustomer.router, prefix="/paymentsfromcustomer", tags=["paymentsfromcustomer"])
api_router.include_router(reporting.router, prefix="/reporting", tags=["reporting"])