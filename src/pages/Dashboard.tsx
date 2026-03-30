import { useEffect, useState } from "react";
import { dashboard } from "../api/client";
import { CategoryBar } from "../components/CategoryBar";
import { TransactionRow } from "../components/TransactionRow";
import type { DashboardData } from "../types";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard
      .get()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="page container" style={{ paddingTop: "2rem" }}>
        <div
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          loading...
        </div>
      </div>
    );

  const maxCategory = data
    ? Math.max(...data.by_category.map((c) => c.total))
    : 0;

  return (
    <div className="page container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          paisa<span style={{ color: "var(--accent)" }}>.</span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            border: "1px solid var(--border)",
            padding: "4px 10px",
            borderRadius: 4,
          }}
        >
          {data?.month ?? "—"}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div className="section-label">total spent this month</div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          ₹{data?.total_spent.toLocaleString() ?? "0"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          daily avg ₹{Math.round(data?.daily_average ?? 0).toLocaleString()}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginBottom: "1.5rem",
        }}
      >
        {data?.wallet_balances.map((w) => (
          <div key={w.wallet_id} className="card" style={{ padding: "12px" }}>
            <div className="section-label" style={{ marginBottom: 4 }}>
              {w.name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 16,
                fontWeight: 500,
                color: "var(--accent)",
              }}
            >
              ₹{w.balance.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div className="section-label">by category</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data?.by_category.map((c) => (
            <CategoryBar
              key={c.category}
              category={c.category}
              amount={c.total}
              maxAmount={maxCategory}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="section-label">recent</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data?.recent_transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
          {!data?.recent_transactions.length && (
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              no transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
