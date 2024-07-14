# app/api/routes/parts.py

from fastapi import APIRouter, HTTPException
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.models import PartCreate, PartUpdate, PartPublic, PartsPublic
from app.crud import parts as parts_crud

router = APIRouter()

@router.post("/", response_model=PartPublic)
def create_part(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    part_in: PartCreate
) -> Any:
    """
    Create new part.
    """
    try:
        return parts_crud.create_part_db(session, part_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{part_id}", response_model=PartPublic)
def update_part(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    part_id: int,
    part_in: PartUpdate
) -> Any:
    """
    Update an existing part.
    """
    part = parts_crud.get_part_db(session, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    try:
        return parts_crud.update_part_db(session, part, part_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/", response_model=PartsPublic)
def read_parts(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve parts.
    """
    parts = parts_crud.get_parts_db(session, skip, limit)
    count = parts_crud.get_parts_count_db(session)
    return PartsPublic(data=parts, count=count)

@router.get("/{part_id}", response_model=PartPublic)
def read_part(
    session: SessionDep,
    current_user: CurrentUser,
    part_id: int
) -> Any:
    """
    Get part by ID.
    """
    part = parts_crud.get_part_db(session, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part

@router.delete("/{part_id}")
def delete_part(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    part_id: int
) -> Any:
    """
    Delete a part.
    """
    part = parts_crud.get_part_db(session, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    parts_crud.delete_part_db(session, part)
    return {"message": "Part deleted successfully"}