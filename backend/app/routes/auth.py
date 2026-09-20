from fastapi import APIRouter, HTTPException, status
from app.database import users_collection
from app.models.user import UserRegister, UserLogin, TokenResponse, UserOut
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


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