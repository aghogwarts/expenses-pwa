import aiosqlite
import os

DB_PATH = os.getenv("DB_PATH", "./paisa.db")

CREATE_TABLES = """
CREATE TABLE IF NOT EXISTS wallets (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    type       TEXT NOT NULL CHECK(type IN ('cash','debit','credit')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS funding_events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_id  INTEGER NOT NULL REFERENCES wallets(id),
    amount     REAL NOT NULL,
    date       TEXT NOT NULL,
    note       TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_id      INTEGER NOT NULL REFERENCES wallets(id),
    amount         REAL NOT NULL,
    description    TEXT NOT NULL,
    category       TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    date           TEXT NOT NULL,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
"""

async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(CREATE_TABLES)
        await db.commit()

        cursor = await db.execute("SELECT COUNT(*) FROM wallets")
        count = (await cursor.fetchone())[0]
        if count == 0:
            await db.execute(
                "INSERT INTO wallets (name, type) VALUES (?, ?), (?, ?)",
                ("Cash", "cash", "Debit", "debit")
            )
            await db.commit()