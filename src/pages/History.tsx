import { useEffect, useState } from 'react';
import { transactions } from '../api/client';
import { TransactionRow } from '../components/TransactionRow';
import type { Transaction, Category } from '../types';
import { CATEGORY_LABELS } from '../types';

const CATEGORIES: Category[] = ['food', 'transport', 'health', 'education', 'bills', 'home', 'misc'];

export function History() {
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchTransactions = () => {
    setLoading(true);
    transactions.list({
      category: category || undefined,
      from: from || undefined,
      to: to || undefined,
    }).then(res => {
      setTxList(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, [category, from, to]);

  const handleDelete = async (id: number) => {
    await transactions.delete(id);
    setTxList(prev => prev.filter(tx => tx.id !== id));
  };

  const total = txList.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="page container">
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 18,
        fontWeight: 500, marginBottom: '1rem',
      }}>
        paisa<span style={{ color: 'var(--accent)' }}>.</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 10 }}>history</span>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
            <button
              className={`chip${category === '' ? ' active' : ''}`}
              onClick={() => setCategory('')}
            >all</button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`chip${category === c ? ' active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
        <div>
          <div className="section-label">from</div>
          <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        </div>
        <div>
          <div className="section-label">to</div>
          <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
          {txList.length} {txList.length === 1 ? 'entry' : 'entries'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--danger)' }}>
          total ₹{total.toLocaleString()}
        </div>
      </div>

      {loading ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {txList.map(tx => (
            <TransactionRow key={tx.id} transaction={tx} onDelete={handleDelete} />
          ))}
          {txList.length === 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
              no transactions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}