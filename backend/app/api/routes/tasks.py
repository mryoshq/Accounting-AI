from fastapi import APIRouter, HTTPException
from typing import Any
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    TaskCreate, 
    TaskPublic, 
    TasksPublic, 
    TaskUpdate
)
from app.crud import tasks as tasks_crud

router = APIRouter()

@router.get("/", response_model=TasksPublic)
def read_tasks(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve tasks.
    """
    tasks = tasks_crud.get_tasks_db(session, skip=skip, limit=limit)
    count = tasks_crud.get_tasks_count_db(session)
    return TasksPublic(data=tasks, count=count)

@router.get("/{task_id}", response_model=TaskPublic)
def read_task(session: SessionDep, current_user: CurrentUser, task_id: int) -> Any:
    """
    Get task by ID.
    """
    task = tasks_crud.get_task_db(session, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/", response_model=TaskPublic)
def create_task(
    *, session: SessionDep, current_user: CurrentUser, task_in: TaskCreate
) -> Any:
    """
    Create new task.
    """
    return tasks_crud.create_task_db(session, task_in, user_id=current_user.id)
    
@router.patch("/{task_id}", response_model=TaskPublic)
def update_task(
    *, session: SessionDep, current_user: CurrentUser, task_id: int, task_in: TaskUpdate
) -> Any:
    """
    Update an existing task.
    """
    task = tasks_crud.get_task_db(session, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks_crud.update_task_db(session, task, task_in)

@router.delete("/{task_id}", response_model=TaskPublic)
def delete_task(session: SessionDep, current_user: CurrentUser, task_id: int) -> Any:
    """
    Delete task.
    """
    task = tasks_crud.get_task_db(session, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks_crud.delete_task_db(session, task)