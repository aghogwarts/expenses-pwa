from fastapi import APIRouter, Depends
from datetime import datetime
from app.database import get_db
from app.auth import verify_token

router = APIRouter(dependencies=[Depends(verify_token)])

@router.get("/api/dashboard")
async def get_dashboard(month: str = None, db=Depends(get_db)):
    if not month:
        month = datetime.now().strftime("%Y-%m")

    start = f"{month}-01"
    year, mon = map(int, month.split("-"))
    if mon == 12:
        end = f"{year+1}-01-01"
    else:
        end = f"{year}-{mon+1:02d}-01"

    total_row = await (await db.execute(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE date >= ? AND date < ?",
        (start, end)
    )).fetchone()
    total_spent = total_row["total"]

    days_in_month = (datetime.strptime(end, "%Y-%m-%d") - datetime.strptime(start, "%Y-%m-%d")).days
    daily_avg = total_spent / days_in_month if days_in_month > 0 else 0

    cat_cursor = await db.execute(
        "SELECT category, COALESCE(SUM(amount), 0) as total FROM transactions "
        "WHERE date >= ? AND date < ? GROUP BY category ORDER BY total DESC",
        (start, end)
    )
    by_category = [{"category": r["category"], "total": r["total"]}
                   for r in await cat_cursor.fetchall()]

    wallets_cursor = await db.execute("SELECT * FROM wallets")
    wallets = await wallets_cursor.fetchall()
    wallet_balances = []

    for w in wallets:
        funded_row = await (await db.execute(
            "SELECT COALESCE(SUM(amount), 0) as total FROM funding_events WHERE wallet_id = ?",
            (w["id"],)
        )).fetchone()
        spent_row = await (await db.execute(
            "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ?",
            (w["id"],)
        )).fetchone()
        balance = funded_row["total"] - spent_row["total"]
        wallet_balances.append({
            "wallet_id": w["id"],
            "name": w["name"],
            "type": w["type"],
            "balance": round(balance, 2),
        })

    recent_cursor = await db.execute(
        "SELECT t.*, w.name as wallet_name FROM transactions t "
        "JOIN wallets w ON t.wallet_id = w.id "
        "ORDER BY t.date DESC, t.created_at DESC LIMIT 5"
    )
    recent = [dict(r) for r in await recent_cursor.fetchall()]

    return {
        "month": month,
        "total_spent": round(total_spent, 2),
        "daily_average": round(daily_avg, 2),
        "by_category": by_category,
        "wallet_balances": wallet_balances,
        "recent_transactions": recent,
    }