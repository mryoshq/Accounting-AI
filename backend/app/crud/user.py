from typing import Any, Union, List
from sqlmodel import Session, select
from app.core.security import get_password_hash, verify_password, hash_backup_codes, generate_backup_codes
from app.models import User, UserCreate, UserUpdate
import base64




def authenticate_user(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email_db(session=session, email=email)
    if not db_user:
        return None
    if verify_password(password, db_user.hashed_password):
        return db_user
    if db_user.backup_codes:
        for hashed_code in db_user.backup_codes:
            if verify_password(password, hashed_code):
                # Remove the used backup code
                db_user.backup_codes = [code for code in db_user.backup_codes if code != hashed_code]
                session.add(db_user)
                session.commit()
                return db_user
    return None


#
# USER CRUD
def create_user_db(*, session: Session, user_in: UserCreate) -> User:
    db_obj = User.model_validate(
        user_in, update={"hashed_password": get_password_hash(user_in.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def update_user_db(*, session: Session, db_user: User, user_in: Union[UserUpdate, dict]) -> User:
    if isinstance(user_in, dict):
        update_data = user_in
    else:
        update_data = user_in.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        password = update_data["password"]
        hashed_password = get_password_hash(password)
        update_data["hashed_password"] = hashed_password
        del update_data["password"]
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def get_user_by_email_db(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user

#
# USER PROFILE PICTURE

def update_user_profile_picture_db(*, session: Session, user: User, image_data: bytes) -> User:
    encoded_image = base64.b64encode(image_data).decode('utf-8')
    user.profile_picture = encoded_image
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def delete_user_profile_picture_db(*, session: Session, user: User) -> User:
    user.profile_picture = None
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


#
# BACKUP CODES


def generate_backup_codes_db(*, session: Session, user: User) -> List[str]:
    plain_codes = generate_backup_codes()  # Generate new codes
    hashed_codes = hash_backup_codes(plain_codes)
    user.backup_codes = hashed_codes
    session.add(user)
    session.commit()
    return plain_codes  # Return the plain codes

def invalidate_backup_codes_db(*, session: Session, user: User) -> None:
    user.backup_codes = []
    session.add(user)
    session.commit()