from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    password: str

class TransactionCreate(BaseModel):
    wallet_id: int
    amount: float
    description: str
    category: str
    payment_method: str
    date: str

class FundingCreate(BaseModel):
    amount: float
    date: str
    note: Optional[str] = None

class WalletCreate(BaseModel):
    name: str
    type: str