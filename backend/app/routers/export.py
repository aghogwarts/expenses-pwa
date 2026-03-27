from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
import csv, io
from app.database import get_db
from app.auth import verify_token

router = APIRouter(dependencies=[Depends(verify_token)])

@router.get("/api/export/csv")
async def export_csv(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    db=Depends(get_db)
):
    query = """
        SELECT t.date, t.description, t.category, t.payment_method,
               t.amount, w.name as wallet
        FROM transactions t
        JOIN wallets w ON t.wallet_id = w.id
        WHERE 1=1
    """
    params = []
    if from_date:
        query += " AND t.date >= ?"
        params.append(from_date)
    if to_date:
        query += " AND t.date <= ?"
        params.append(to_date)
    query += " ORDER BY t.date DESC"

    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["date", "description", "category", "payment_method", "amount", "wallet"])
    for row in rows:
        writer.writerow([row["date"], row["description"], row["category"],
                         row["payment_method"], row["amount"], row["wallet"]])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=paisa-export.csv"}
    )