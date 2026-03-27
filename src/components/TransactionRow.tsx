import type { Transaction } from '../types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../types';

interface Props {
  transaction: Transaction;
  onDelete?: (id: number) => void;
}

export function TransactionRow({ transaction: tx, onDelete }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px',
      background: 'var(--bg-alt)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: CATEGORY_COLORS[tx.category],
        }} />
        <div>
          <div style={{ fontSize: 13 }}>{tx.description}</div>
          <div style={{
            fontSize: 10, color: 'var(--muted)',
            fontFamily: 'var(--font-mono)', marginTop: 2,
          }}>
            {CATEGORY_LABELS[tx.category]} · {tx.payment_method} · {tx.date}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
          ₹{tx.amount.toLocaleString()}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(tx.id)}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              fontSize: 14, cursor: 'pointer', padding: '0 4px',
            }}
          >×</button>
        )}
      </div>
    </div>
  );
}