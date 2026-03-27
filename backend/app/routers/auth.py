from fastapi import APIRouter, HTTPException
from app.models import LoginRequest
from app.auth import verify_password, create_token

router = APIRouter()

@router.post("/api/auth/login")
async def login(body: LoginRequest):
    if not verify_password(body.password):
        raise HTTPException(status_code=401, detail="Wrong password")
    return {"access_token": create_token(), "token_type": "bearer"}