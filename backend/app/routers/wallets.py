from fastapi import APIRouter, Depends
from app.database import get_db
from app.models import FundingCreate, WalletCreate
from app.auth import verify_token

router = APIRouter(dependencies=[Depends(verify_token)])

@router.get("/api/wallets")
async def list_wallets(db=Depends(get_db)):
    cursor = await db.execute("SELECT * FROM wallets ORDER BY id")
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/api/wallets", status_code=201)
async def create_wallet(body: WalletCreate, db=Depends(get_db)):
    cursor = await db.execute(
        "INSERT INTO wallets (name, type) VALUES (?, ?)",
        (body.name, body.type)
    )
    await db.commit()
    row = await (await db.execute(
        "SELECT * FROM wallets WHERE id = ?", (cursor.lastrowid,)
    )).fetchone()
    return dict(row)

@router.post("/api/wallets/{wallet_id}/fund", status_code=201)
async def fund_wallet(wallet_id: int, body: FundingCreate, db=Depends(get_db)):
    cursor = await db.execute(
        "INSERT INTO funding_events (wallet_id, amount, date, note) VALUES (?, ?, ?, ?)",
        (wallet_id, body.amount, body.date, body.note)
    )
    await db.commit()
    row = await (await db.execute(
        "SELECT * FROM funding_events WHERE id = ?", (cursor.lastrowid,)
    )).fetchone()
    return dict(row)

@router.get("/api/wallets/cycles")
async def get_cycles(db=Depends(get_db)):
    wallets_cursor = await db.execute("SELECT * FROM wallets ORDER BY id")
    wallets = await wallets_cursor.fetchall()
    result = []

    for wallet in wallets:
        wid = wallet["id"]

        last_funding = await (await db.execute(
            "SELECT * FROM funding_events WHERE wallet_id = ? ORDER BY date DESC, id DESC LIMIT 1",
            (wid,)
        )).fetchone()

        if not last_funding:
            result.append({
                "wallet_id": wid,
                "wallet_name": wallet["name"],
                "wallet_type": wallet["type"],
                "funding_event_id": None,
                "funded_on": None,
                "opening_amount": 0,
                "leftover_from_previous": 0.0,
                "total_available": 0.0,
                "total_spent": 0.0,
                "current_balance": 0.0,
                "transactions": [],
            })
            continue

        prev_funding = await (await db.execute(
            "SELECT * FROM funding_events WHERE wallet_id = ? AND id < ? ORDER BY date DESC LIMIT 1",
            (wid, last_funding["id"])
        )).fetchone()

        leftover = 0.0
        if prev_funding:
            prev_spent_row = await (await db.execute(
                "SELECT COALESCE(SUM(amount), 0) as total FROM transactions "
                "WHERE wallet_id = ? AND date >= ? AND date < ?",
                (wid, prev_funding["date"], last_funding["date"])
            )).fetchone()
            leftover = max(0, prev_funding["amount"] + leftover - prev_spent_row["total"])

        total_available = last_funding["amount"] + leftover

        txs_cursor = await db.execute(
            "SELECT t.*, w.name as wallet_name FROM transactions t "
            "JOIN wallets w ON t.wallet_id = w.id "
            "WHERE t.wallet_id = ? AND t.date >= ? "
            "ORDER BY t.date DESC",
            (wid, last_funding["date"])
        )
        txs = await txs_cursor.fetchall()
        total_spent = sum(tx["amount"] for tx in txs)

        result.append({
            "wallet_id": wid,
            "wallet_name": wallet["name"],
            "wallet_type": wallet["type"],
            "funding_event_id": last_funding["id"],
            "funded_on": last_funding["date"],
            "opening_amount": last_funding["amount"],
            "leftover_from_previous": round(leftover, 2),
            "total_available": round(total_available, 2),
            "total_spent": round(total_spent, 2),
            "current_balance": round(total_available - total_spent, 2),
            "transactions": [dict(tx) for tx in txs],
        })

    return result