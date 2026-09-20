import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from app.database import users_collection

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

_google_request = google_requests.Request()

security_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def verify_google_token(credential: str) -> dict:
    """Verifies a Google Sign-In ID token: checks its signature against Google's
    public keys AND that it was issued for OUR client ID. That second check is
    the critical part — without it, a valid ID token minted for some other
    app could be replayed against this backend and accepted."""
    try:
        payload = google_id_token.verify_oauth2_token(
            credential, _google_request, GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential",
        )

    if payload.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
        )
    if not payload.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email is not verified",
        )
    return payload


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


optional_security_scheme = HTTPBearer(auto_error=False)


async def get_optional_admin(credentials: HTTPAuthorizationCredentials = Depends(optional_security_scheme)) -> bool:
    """Returns True if the request carries a valid admin token, False otherwise.
    Never raises — used to decide whether to include admin-only fields in a
    public response, not to gate access to the route itself."""
    if credentials is None:
        return False
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            return False
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        return bool(user and user.get("role") == "admin")
    except Exception:
        return False