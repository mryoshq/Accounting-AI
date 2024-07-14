
from fastapi import APIRouter, HTTPException
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    ProjectCreate, 
    ProjectPublic, 
    ProjectsPublic, 
    ProjectUpdate,
    PartsPublic, 
    PartPublic,
    PaymentToSuppliersPublic
)
from app.crud import projects as projects_crud

router = APIRouter()

@router.get("/", response_model=ProjectsPublic)
def read_projects(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve projects.
    """
    projects = projects_crud.get_projects_db(session, skip=skip, limit=limit)
    count = projects_crud.get_projects_count_db(session)
    return ProjectsPublic(data=projects, count=count)

@router.get("/{project_id}", response_model=ProjectPublic)
def read_project(session: SessionDep, current_user: CurrentUser, project_id: int) -> Any:
    """
    Get project by ID.
    """
    project = projects_crud.get_project_db(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/", response_model=ProjectPublic)
def create_project(
    *, session: SessionDep, current_user: CurrentUser, project_in: ProjectCreate
) -> Any:
    """
    Create new project.
    """
    return projects_crud.create_project_db(session, project_in)

@router.patch("/{project_id}", response_model=ProjectPublic)
def update_project(
    *, session: SessionDep, current_user: CurrentUser, project_id: int, project_in: ProjectUpdate
) -> Any:
    """
    Update an existing project.
    """
    project = projects_crud.get_project_db(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_crud.update_project_db(session, project, project_in)

@router.get("/{project_id}/parts", response_model=PartsPublic)
def read_project_parts(
    session: SessionDep, current_user: CurrentUser, project_id: int
) -> Any:
    """
    Retrieve parts for a specific project.
    """
    project = projects_crud.get_project_db(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    parts = projects_crud.get_project_parts_db(session, project_id)
    return PartsPublic(data=parts, count=len(parts))

@router.get("/{project_id}/parts/{part_id}", response_model=PartPublic)
def read_project_part_by_project_and_part_id(
    session: SessionDep,
    current_user: CurrentUser,
    project_id: int,
    part_id: int,
) -> Any:
    """
    Get part by part ID for a specific project.
    """
    project = projects_crud.get_project_db(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    part = projects_crud.get_project_part_db(session, project_id, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found for this project")

    return part

@router.delete("/{project_id}", response_model=ProjectPublic)
def delete_project(session: SessionDep, current_user: CurrentUser, project_id: int) -> Any:
    """
    Delete project.
    """
    project = projects_crud.get_project_db(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_crud.delete_project_db(session, project)

@router.get("/{project_id}/payments", response_model=PaymentToSuppliersPublic)
def read_payments_for_project(
    session: SessionDep, 
    current_user: CurrentUser, 
    project_id: int
) -> Any:
    """
    Retrieve all payments to suppliers for a specific project.
    """
    project = projects_crud.get_project_db(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    payments = projects_crud.get_project_payments_db(session, project_id)
    return PaymentToSuppliersPublic(data=payments, count=len(payments))