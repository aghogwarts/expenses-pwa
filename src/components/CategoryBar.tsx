import { CATEGORY_LABELS, CATEGORY_COLORS } from "../types";
import type { Category } from "../types";

interface Props {
  category: Category;
  amount: number;
  maxAmount: number;
}

export function CategoryBar({ category, amount, maxAmount }: Props) {
  const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          width: 110,
          flexShrink: 0,
          color: "var(--text)",
        }}
      >
        {CATEGORY_LABELS[category]}
      </div>
      <div
        style={{
          flex: 1,
          height: 4,
          background: "var(--border)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            width: `${pct}%`,
            background: pct > 70 ? "var(--danger)" : CATEGORY_COLORS[category],
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--muted)",
          width: 70,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        ₹{amount.toLocaleString()}
      </div>
    </div>
  );
}
