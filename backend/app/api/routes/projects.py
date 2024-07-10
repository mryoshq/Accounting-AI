from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Project, 
    ProjectCreate, 
    ProjectPublic, 
    ProjectsPublic, 
    ProjectUpdate
    )

from app.models import ( 
    Part, 
    PartsPublic, 
    PartPublic
    )

from app.models import PaymentToSuppliersPublic

router = APIRouter()

# --- Project Endpoints ---
#
# read 
@router.get("/", response_model=ProjectsPublic)
def read_projects(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve projects.
    """
    count_statement = select(func.count()).select_from(Project)
    count = session.exec(count_statement).one()
    statement = select(Project).offset(skip).limit(limit)
    projects = session.exec(statement).all()
    return ProjectsPublic(data=projects, count=count)


@router.get("/{project_id}", response_model=ProjectPublic)
def read_project(session: SessionDep, current_user: CurrentUser, project_id: int) -> Any:
    """
    Get project by ID.
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

#
# modify
@router.post("/", response_model=ProjectPublic)
def create_project(
    *, session: SessionDep, current_user: CurrentUser, project_in: ProjectCreate
) -> Any:
    """
    Create new project.
    """
    project = Project.from_orm(project_in)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.patch("/{project_id}", response_model=ProjectPublic)
def update_project(
    *, session: SessionDep, current_user: CurrentUser, project_id: int, project_in: ProjectUpdate
) -> Any:
    """
    Update an existing project.
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project_data = project_in.dict(exclude_unset=True)
    for key, value in project_data.items():
        setattr(project, key, value)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


# --- Project Item Endpoints ---

# --- Project Part Endpoints ---

# Read parts for a specific project
@router.get("/{project_id}/parts", response_model=PartsPublic)
def read_project_parts(
    session: SessionDep, current_user: CurrentUser, project_id: int
) -> Any:
    """
    Retrieve parts for a specific project.
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return PartsPublic(data=project.parts, count=len(project.parts))


# Read part by project and part ID
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
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    part = (
        session.query(Part)
        .filter(
            Part.id == part_id,
            Part.project_id == project_id,
        )
        .first()
    )

    if not part:
        raise HTTPException(
            status_code=404, detail="Part not found for this project"
        )

    return part


@router.delete("/{project_id}", response_model=ProjectPublic)
def delete_project(session: SessionDep, current_user: CurrentUser, project_id: int) -> Any:
    """
    Delete project.
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return project


# --- project payments endpoints ---

@router.get("/{project_id}/payments", response_model=PaymentToSuppliersPublic)
def read_payments_for_project(
    session: SessionDep, 
    current_user: CurrentUser, 
    project_id: int
) -> Any:
    """
    Retrieve all payments to suppliers for a specific project.
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    payments = project.payments_to_suppliers
    return PaymentToSuppliersPublic(data=payments, count=len(payments))