import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { transactions, wallets } from "../api/client";
import type { Wallet, Category, PaymentMethod } from "../types";
import { CATEGORY_LABELS } from "../types";

const CATEGORIES: Category[] = [
  "food",
  "transport",
  "health",
  "education",
  "bills",
  "home",
  "misc",
];

export function AddExpense() {
  const navigate = useNavigate();
  const [walletList, setWalletList] = useState<Wallet[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [walletId, setWalletId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    wallets.list().then((res) => {
      setWalletList(res.data);
      if (res.data.length > 0) setWalletId(res.data[0].id);
    });
  }, []);

  const handleSubmit = async () => {
    if (!amount || !description || !walletId) {
      setError("Fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await transactions.create({
        amount: parseFloat(amount),
        description,
        category,
        wallet_id: walletId,
        payment_method: paymentMethod,
        date,
      });
      navigate("/");
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          marginBottom: "1.5rem",
        }}
      >
        paisa<span style={{ color: "var(--accent)" }}>.</span>
        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 10 }}>
          new entry
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <div className="section-label">amount</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bg-alt)",
              border: "1px solid var(--border-2)",
              borderRadius: "var(--radius)",
              padding: "14px 16px",
            }}
          >
            <span
              style={{
                color: "var(--subtle)",
                fontSize: 18,
                fontFamily: "var(--font-mono)",
              }}
            >
              ₹
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 28,
                fontWeight: 500,
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                width: "100%",
              }}
            />
          </div>
        </div>

        <div>
          <div className="section-label">description</div>
          <input
            className="input"
            type="text"
            placeholder="what was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <div className="section-label">category</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`chip${category === c ? " active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="section-label">payment method</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {(["cash", "debit", "credit"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                className={`chip${paymentMethod === m ? " active" : ""}`}
                onClick={() => setPaymentMethod(m)}
                style={{ borderRadius: "var(--radius)", padding: "10px" }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {walletList.length > 1 && (
          <div>
            <div className="section-label">wallet</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {walletList.map((w) => (
                <button
                  key={w.id}
                  className={`chip${walletId === w.id ? " active" : ""}`}
                  onClick={() => setWalletId(w.id)}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="section-label">date</div>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
          />
        </div>

        {error && (
          <div
            style={{
              fontSize: 12,
              color: "var(--danger)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            height: 48,
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
          }}
        >
          {loading ? "saving..." : "add expense"}
        </button>
      </div>
    </div>
  );
}
