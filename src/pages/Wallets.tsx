import { useEffect, useState } from "react";
import { wallets } from "../api/client";
import type { Cycle } from "../types";

export function Wallets() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState<{
    [walletId: number]: { amount: string; date: string; note: string };
  }>({});
  const [showFund, setShowFund] = useState<number | null>(null);

  const fetchCycles = () => {
    wallets
      .cycles()
      .then((res) => {
        setCycles(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleFund = async (walletId: number) => {
    const f = funding[walletId];
    if (!f?.amount || !f?.date) return;
    await wallets.fund(walletId, {
      amount: parseFloat(f.amount),
      date: f.date,
      note: f.note || undefined,
    });
    setShowFund(null);
    setFunding((prev) => ({
      ...prev,
      [walletId]: { amount: "", date: "", note: "" },
    }));
    fetchCycles();
  };

  const updateFunding = (walletId: number, field: string, value: string) => {
    setFunding((prev) => ({
      ...prev,
      [walletId]: { ...prev[walletId], [field]: value },
    }));
  };

  if (loading)
    return (
      <div className="page container">
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

  return (
    <div className="page container">
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 18,
          fontWeight: 500,
          marginBottom: "1.5rem",
        }}
      >
        paisa<span style={{ color: "var(--accent)" }}>.</span>
        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 10 }}>
          wallets
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cycles.map((cycle) => {
          const pct =
            cycle.total_available > 0
              ? (cycle.total_spent / cycle.total_available) * 100
              : 0;
          const barColor =
            pct > 80
              ? "var(--danger)"
              : pct > 60
                ? "var(--warning)"
                : "var(--accent)";
          const isFunding = showFund === cycle.wallet_id;
          const f = funding[cycle.wallet_id] ?? {
            amount: "",
            date: new Date().toISOString().split("T")[0],
            note: "",
          };

          return (
            <div key={cycle.wallet_id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {cycle.wallet_name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "var(--muted)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    {cycle.wallet_type} · cycle active
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 18,
                        fontWeight: 500,
                        color: "var(--accent)",
                      }}
                    >
                      ₹{cycle.current_balance.toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      current balance
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (isFunding) {
                        setShowFund(null);
                      } else {
                        setShowFund(cycle.wallet_id);
                        setFunding((prev) => ({
                          ...prev,
                          [cycle.wallet_id]: {
                            amount: prev[cycle.wallet_id]?.amount ?? "",
                            date:
                              prev[cycle.wallet_id]?.date ??
                              new Date().toISOString().split("T")[0],
                            note: prev[cycle.wallet_id]?.note ?? "",
                          },
                        }));
                      }
                    }}
                    style={{
                      background: isFunding
                        ? "var(--surface)"
                        : "rgba(76,175,80,0.1)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      padding: "5px 10px",
                      cursor: "pointer",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {isFunding ? "cancel" : "+ fund"}
                  </button>
                </div>
              </div>

              {isFunding && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <div className="section-label" style={{ marginBottom: 8 }}>
                    add funding event
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div className="section-label">amount</div>
                      <input
                        className="input"
                        type="number"
                        placeholder="5000"
                        value={f.amount}
                        onChange={(e) =>
                          updateFunding(
                            cycle.wallet_id,
                            "amount",
                            e.target.value,
                          )
                        }
                        style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="section-label">date</div>
                      <input
                        className="input"
                        type="date"
                        value={f.date}
                        onChange={(e) =>
                          updateFunding(cycle.wallet_id, "date", e.target.value)
                        }
                        style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div className="section-label">note (optional)</div>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. dad gave cash"
                      value={f.note}
                      onChange={(e) =>
                        updateFunding(cycle.wallet_id, "note", e.target.value)
                      }
                      style={{ fontSize: 13 }}
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => handleFund(cycle.wallet_id)}
                    style={{
                      height: 40,
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    confirm funding
                  </button>
                </div>
              )}

              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                    }}
                  >
                    funded {cycle.funded_on}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                    }}
                  >
                    ₹{cycle.total_spent.toLocaleString()} of ₹
                    {cycle.total_available.toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    height: 3,
                    background: "var(--border)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      width: `${Math.min(pct, 100)}%`,
                      background: barColor,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                    <span style={{ color: "var(--muted)" }}>opened </span>₹
                    {cycle.opening_amount.toLocaleString()}
                  </div>
                  {cycle.leftover_from_previous > 0 && (
                    <div
                      style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
                    >
                      <span style={{ color: "var(--muted)" }}>+leftover </span>₹
                      {cycle.leftover_from_previous.toLocaleString()}
                    </div>
                  )}
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                    <span style={{ color: "var(--muted)" }}>left </span>₹
                    {cycle.current_balance.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ padding: "8px 16px" }}>
                {cycle.transactions.slice(0, 4).map((tx, i) => (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 0",
                      borderBottom:
                        i < Math.min(cycle.transactions.length, 4) - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12 }}>{tx.description}</div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--muted)",
                          marginTop: 1,
                        }}
                      >
                        {tx.category} · {tx.date}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--danger)",
                      }}
                    >
                      ₹{tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
                {cycle.transactions.length > 4 && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      fontFamily: "var(--font-mono)",
                      paddingTop: 8,
                    }}
                  >
                    + {cycle.transactions.length - 4} more transactions
                  </div>
                )}
                {cycle.transactions.length === 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontFamily: "var(--font-mono)",
                      padding: "6px 0",
                    }}
                  >
                    no transactions in this cycle yet
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {cycles.length === 0 && (
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            no wallets found
          </div>
        )}
      </div>
    </div>
  );
}
