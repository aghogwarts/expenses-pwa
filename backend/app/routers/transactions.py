from fastapi import APIRouter, Depends
from typing import Optional
from app.database import get_db
from app.models import TransactionCreate
from app.auth import verify_token

router = APIRouter(dependencies=[Depends(verify_token)])

@router.get("/api/transactions")
async def list_transactions(
    category: Optional[str] = None,
    wallet_id: Optional[int] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    db=Depends(get_db)
):
    query = """
        SELECT t.*, w.name as wallet_name
        FROM transactions t
        JOIN wallets w ON t.wallet_id = w.id
        WHERE 1=1
    """
    params = []
    if category:
        query += " AND t.category = ?"
        params.append(category)
    if wallet_id:
        query += " AND t.wallet_id = ?"
        params.append(wallet_id)
    if from_date:
        query += " AND t.date >= ?"
        params.append(from_date)
    if to_date:
        query += " AND t.date <= ?"
        params.append(to_date)
    query += " ORDER BY t.date DESC, t.created_at DESC"

    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/api/transactions", status_code=201)
async def create_transaction(body: TransactionCreate, db=Depends(get_db)):
    cursor = await db.execute(
        """INSERT INTO transactions
           (wallet_id, amount, description, category, payment_method, date)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (body.wallet_id, body.amount, body.description,
         body.category, body.payment_method, body.date)
    )
    await db.commit()
    row = await (await db.execute(
        "SELECT t.*, w.name as wallet_name FROM transactions t "
        "JOIN wallets w ON t.wallet_id = w.id WHERE t.id = ?",
        (cursor.lastrowid,)
    )).fetchone()
    return dict(row)

@router.delete("/api/transactions/{tx_id}", status_code=204)
async def delete_transaction(tx_id: int, db=Depends(get_db)):
    await db.execute("DELETE FROM transactions WHERE id = ?", (tx_id,))
    await db.commit()