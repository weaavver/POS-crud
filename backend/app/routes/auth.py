import re
from typing import Union
from fastapi import APIRouter, HTTPException, status
from app.database import users_collection
from app.models.user import UserRegister, UserLogin, TokenResponse, UserOut, GoogleAuth, NeedsUsername
from app.utils.security import hash_password, verify_password, create_access_token, verify_google_token

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_out_response(user_id: str, user: dict) -> TokenResponse:
    token = create_access_token({"sub": user_id, "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=user_id,
            name=user["name"],
            username=user["username"],
            email=user["email"],
            role=user["role"],
        ),
    )


async def _suggest_username(base: str) -> str:
    # Keep only what the username pattern allows, and make sure it's long enough.
    cleaned = re.sub(r"[^a-zA-Z0-9_]", "", base) or "user"
    cleaned = cleaned[:20]
    if len(cleaned) < 3:
        cleaned = (cleaned + "user")[:20]

    candidate = cleaned
    suffix = 0
    # Avoid colliding with an existing username.
    while await users_collection.find_one({"username": candidate}):
        suffix += 1
        candidate = f"{cleaned[:20 - len(str(suffix))]}{suffix}"
    return candidate


@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    if await users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Role is always "customer" here. Admins are promoted by hand in MongoDB.
    user_doc = {
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "role": "customer",
    }
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "role": "customer"})
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=user_id, name=user.name, username=user.username, email=user.email, role="customer"
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"username": credentials.username})
    if not user or not user.get("password") or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=user_id,
            name=user["name"],
            username=user["username"],
            email=user["email"],
            role=user["role"],
        ),
    )


@router.post("/google", response_model=Union[TokenResponse, NeedsUsername])
async def google_auth(payload: GoogleAuth):
    google_payload = verify_google_token(payload.credential)
    google_id = google_payload["sub"]
    email = google_payload["email"]
    name = google_payload.get("name") or email.split("@")[0]

    # 1. Already signed up with Google before -> log straight in.
    user = await users_collection.find_one({"google_id": google_id})
    if user:
        return _user_out_response(str(user["_id"]), user)

    # 2. An account with this email already exists (registered with a
    #    password) -> link the Google ID to it so either method works from
    #    now on, rather than blocking or creating a duplicate account.
    user = await users_collection.find_one({"email": email})
    if user:
        await users_collection.update_one(
            {"_id": user["_id"]}, {"$set": {"google_id": google_id}}
        )
        user["google_id"] = google_id
        return _user_out_response(str(user["_id"]), user)

    # 3. Brand-new person. If we don't have a username for them yet, ask the
    #    frontend to collect one before we create anything.
    if not payload.username:
        suggested = await _suggest_username(email.split("@")[0])
        return NeedsUsername(suggested_name=suggested, email=email, name=name)

    if await users_collection.find_one({"username": payload.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Google-only account: no password field at all, so a password login can
    # never succeed for it unless they separately set one.
    user_doc = {
        "name": name,
        "username": payload.username,
        "email": email,
        "google_id": google_id,
        "role": "customer",
    }
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)
    return _user_out_response(user_id, user_doc | {"_id": result.inserted_id})