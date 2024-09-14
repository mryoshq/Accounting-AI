from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, delete, func, select

from app.crud.user import (
    create_user_db,
    get_user_by_email_db,
    update_user_db,
)
from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, encrypt_token, decrypt_token, preview_token
from app.models import (
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
    ApiTokenCreate,
    ApiTokenResponse,
    FullApiTokenResponse,
)
from app.utils import generate_new_account_email, send_email

from datetime import datetime

router = APIRouter()

@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return UsersPublic(data=users, count=count)

@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic
)
def create_user(session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = get_user_by_email_db(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = create_user_db(session=session, user_in=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )
        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return user

@router.patch("/me", response_model=UserPublic)
def update_user_me(
    session: SessionDep,
    user_in: UserUpdateMe,
    current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """
    if user_in.api_token_enabled is not None and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superusers can enable/disable API tokens")
    
    if user_in.email:
        existing_user = get_user_by_email_db(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.patch("/me/password", response_model=Message)
def update_password_me(
    session: SessionDep,
    body: UpdatePassword,
    current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")

@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user

@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")

@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    if not settings.USERS_OPEN_REGISTRATION:
        raise HTTPException(
            status_code=403,
            detail="Open user registration is forbidden on this server",
        )
    user = get_user_by_email_db(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = create_user_db(session=session, user_in=user_create)
    return user

@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: int,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = session.get(User, user_id)
    if user == current_user:
        return user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    return user

@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    session: SessionDep,
    user_id: int,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = get_user_by_email_db(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    db_user = update_user_db(session=session, db_user=db_user, user_in=user_in)
    return db_user

@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep,
    current_user: CurrentUser,
    user_id: int
) -> Message:
    """
    Delete a user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")

# API token management

@router.post("/me/api-token", response_model=ApiTokenResponse)
def create_api_token(
    session: SessionDep,
    body: ApiTokenCreate,
    current_user: CurrentUser
) -> Any:
    """
    Create or refresh API token for the current user.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superusers can create API tokens")
    
    if not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    current_user.api_token = encrypt_token(body.token)
    current_user.api_token_enabled = True
    current_user.api_token_created_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    
    return ApiTokenResponse(
        token_preview=f"{body.token[:5]}...{body.token[-5:]}",
        created_at=current_user.api_token_created_at,
        is_active=True
    )





@router.get("/me/api-token-preview", response_model=ApiTokenResponse)
def get_api_token_preview(
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Retrieve partial information about the current user's API token for frontend use.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superusers can retrieve API tokens")
    
    if not current_user.api_token or not current_user.api_token_enabled:
        raise HTTPException(status_code=404, detail="No active API token found")
    
    # Get the token preview
    token_preview = preview_token(current_user.api_token)
    
    return ApiTokenResponse(
        token_preview=token_preview,
        created_at=current_user.api_token_created_at,
        is_active=current_user.api_token_enabled
    )

@router.get("/internal/full-api-token", response_model=FullApiTokenResponse)
def get_full_api_token(
    session: SessionDep,
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Retrieve the full decrypted API token for internal use.
    This endpoint should only be accessible by the backend services.
    """
    if not current_user.api_token or not current_user.api_token_enabled:
        raise HTTPException(status_code=404, detail="No active API token found")
    
    # Decrypt the stored token
    decrypted_token = decrypt_token(current_user.api_token)
    
    return FullApiTokenResponse(
        token=decrypted_token,
        created_at=current_user.api_token_created_at,
        is_active=current_user.api_token_enabled
    )


    
@router.delete("/me/api-token", response_model=Message)
def delete_api_token(
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Delete the API token for the current user.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superusers can delete API tokens")
    
    current_user.api_token = None
    current_user.api_token_enabled = False
    session.add(current_user)
    session.commit()
    
    return Message(message="API token deleted successfully")