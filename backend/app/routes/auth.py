from fastapi import APIRouter, HTTPException, status
from app.database import users_collection
from app.models.user import UserRegister, UserLogin, TokenResponse, UserOut
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
    }
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user_id, name=user.name, email=user.email, role=user.role),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user_id, name=user["name"], email=user["email"], role=user["role"]),
    )