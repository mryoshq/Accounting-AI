from datetime import datetime, timedelta
from typing import Any
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"

def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.utcnow() + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def encrypt_token(token: str) -> str:
    """
    Encrypt the API token using JWT.
    """
    return create_access_token(token, timedelta(days=36500))  # Set a very long expiration

def decrypt_token(encrypted_token: str) -> str:
    """
    Decrypt the API token.
    """
    try:
        payload = jwt.decode(encrypted_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.JWTError:
        raise ValueError("Invalid token")


def preview_token(encrypted_token: str) -> str:
    """
    Decrypt the API token and return a preview.
    """
    try:
        decrypted_token = decrypt_token(encrypted_token)
        return f"{decrypted_token[:3]}...{decrypted_token[-5:]}"
    except ValueError:
        return "Invalid token"