from sqlmodel import Session, select, func
from typing import Any, List

from app.models import Task, TaskCreate, TaskUpdate

def create_task_db(session: Session, task_in: TaskCreate, user_id: int) -> Task:
    task_data = task_in.model_dump()
    task = Task(**task_data, user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def get_task_db(session: Session, task_id: int) -> Task | None:
    return session.get(Task, task_id)

def get_tasks_db(session: Session, skip: int = 0, limit: int = 100) -> List[Task]:
    return session.exec(select(Task).offset(skip).limit(limit)).all()

def get_tasks_count_db(session: Session) -> int:
    return session.exec(select(func.count()).select_from(Task)).one()

def update_task_db(session: Session, task: Task, task_in: TaskUpdate) -> Task:
    task_data = task_in.model_dump(exclude_unset=True)
    for key, value in task_data.items():
        setattr(task, key, value)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def delete_task_db(session: Session, task: Task) -> Task:
    session.delete(task)
    session.commit()
    return task