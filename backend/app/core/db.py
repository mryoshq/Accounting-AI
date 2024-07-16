from sqlmodel import Session, create_engine, select

from app.crud.user import (  
    create_user_db,
)

from app.core.config import settings
from app.models import User, UserCreate, Project

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly


def init_db(session: Session) -> None:
    # create table without alembic migraitons: 
    # from sqlmodel import SQLModel

    # from app.core.engine import engine
    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = create_user_db(session=session, user_in=user_in)

    # Check and create Sourcing project
    sourcing_project = session.exec(
        select(Project).where(Project.name == "Sourcing")
    ).first()
    if not sourcing_project:
        sourcing_project = Project(name="Sourcing", description="Default sourcing project")
        session.add(sourcing_project)
        session.commit()
        print("Sourcing project created")
    else:
        print("Sourcing project already exists")

    session.commit()