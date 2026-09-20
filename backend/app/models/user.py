from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal


class UserRegister(BaseModel):
    name: str = Field(min_length=4)
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=6)
    # No role field: everyone who registers is a customer.


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    username: str
    email: EmailStr
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut