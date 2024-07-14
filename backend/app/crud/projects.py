
from sqlmodel import Session, select, func
from typing import Any, List


from app.models import Project, ProjectCreate, ProjectUpdate, Part

def create_project_db(session: Session, project_in: ProjectCreate) -> Project:
    project = Project.model_validate(project_in)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

def get_project_db(session: Session, project_id: int) -> Project | None:
    return session.get(Project, project_id)

def get_projects_db(session: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    return session.exec(select(Project).offset(skip).limit(limit)).all()

def get_projects_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(Project)).one()

def update_project_db(session: Session, project: Project, project_in: ProjectUpdate) -> Project:
    project_data = project_in.model_dump(exclude_unset=True)
    for key, value in project_data.items():
        setattr(project, key, value)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

def delete_project_db(session: Session, project: Project) -> Project:
    session.delete(project)
    session.commit()
    return project

def get_project_parts_db(session: Session, project_id: int) -> List[Part]:
    project = session.get(Project, project_id)
    return project.parts if project else []

def get_project_part_db(session: Session, project_id: int, part_id: int) -> Part | None:
    return session.exec(
        select(Part).where(Part.id == part_id, Part.project_id == project_id)
    ).first()

def get_project_payments_db(session: Session, project_id: int) -> List[Any]:
    project = session.get(Project, project_id)
    return project.payments_to_suppliers if project else []