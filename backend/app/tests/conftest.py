from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.db import engine, init_db
from app.main import app
from app.models import User, Supplier, Project, ExternalInvoice
from app.tests.utils.user import authentication_token_from_email
from app.tests.utils.utils import get_superuser_token_headers, random_lower_string, random_float
from app.core.security import get_password_hash


def ensure_superuser(session: Session):
    superuser = session.query(User).filter(User.email == settings.FIRST_SUPERUSER).first()
    if not superuser:
        hashed_password = get_password_hash(settings.FIRST_SUPERUSER_PASSWORD)
        print(f"Hashed Password for Superuser: {hashed_password}")  # Logging for debug
        superuser = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=hashed_password,
            is_superuser=True
        )
        session.add(superuser)
        session.commit()
    else:
        print(f"Superuser already exists. Hashed Password in DB: {superuser.hashed_password}")  # Logging existing hash


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session)
        ensure_superuser(session)
        yield session
        # Add any teardown logic if necessary



@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )


@pytest.fixture
def supplier(db: Session):
    supplier_data = {
        "name": random_lower_string(),
        "ice": random_lower_string(),
        "postal_code": random_lower_string(),
        "rib": random_lower_string()
    }
    supplier = Supplier(**supplier_data)
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@pytest.fixture
def project(db: Session):
    project_data = {
        "name": random_lower_string(),
        "description": random_lower_string()
    }
    project = Project(**project_data)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@pytest.fixture
def external_invoice(db: Session, supplier: Supplier, project: Project):
    invoice_data = {
        "reference": random_lower_string(),
        "invoice_date": "2023-01-01",
        "due_date": "2023-02-01",
        "amount_ttc": random_float(),
        "amount_ht": random_float(),
        "vat": random_float(),
        "currency_type": "MAD",
        "supplier_id": supplier.id,
        "project_id": project.id
    }
    invoice = ExternalInvoice(**invoice_data)
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice