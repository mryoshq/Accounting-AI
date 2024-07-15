from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from app.crud.projects import (
    create_project_db,
    get_project_db,
    update_project_db,
    delete_project_db
)
from app.models import Project, ProjectCreate, ProjectUpdate
from app.tests.utils.utils import random_lower_string

def test_create_project(db: Session) -> None:
    name = random_lower_string()
    description = random_lower_string()
    project_in = ProjectCreate(name=name, description=description)
    project = create_project_db(session=db, project_in=project_in)
    assert project.name == name
    assert project.description == description

def test_get_project(db: Session) -> None:
    name = random_lower_string()
    description = random_lower_string()
    project_in = ProjectCreate(name=name, description=description)
    project = create_project_db(session=db, project_in=project_in)
    stored_project = get_project_db(session=db, project_id=project.id)
    assert stored_project
    assert project.id == stored_project.id
    assert jsonable_encoder(project) == jsonable_encoder(stored_project)

def test_update_project(db: Session) -> None:
    name = random_lower_string()
    description = random_lower_string()
    project_in = ProjectCreate(name=name, description=description)
    project = create_project_db(session=db, project_in=project_in)
    new_name = random_lower_string()
    project_update = ProjectUpdate(name=new_name)
    updated_project = update_project_db(session=db, project=project, project_in=project_update)
    assert updated_project.id == project.id
    assert updated_project.name == new_name
    assert updated_project.description == description

def test_delete_project(db: Session) -> None:
    name = random_lower_string()
    description = random_lower_string()
    project_in = ProjectCreate(name=name, description=description)
    project = create_project_db(session=db, project_in=project_in)
    deleted_project = delete_project_db(session=db, project=project)
    stored_project = get_project_db(session=db, project_id=project.id)
    assert deleted_project.id == project.id
    assert stored_project is None