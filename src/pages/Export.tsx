import { useState } from 'react';
import { exportData } from '../api/client';

export function Export() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await exportData.csv(from || undefined, to || undefined);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `paisa-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 18,
        fontWeight: 500, marginBottom: '1.5rem',
      }}>
        paisa<span style={{ color: 'var(--accent)' }}>.</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 10 }}>export</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <div className="section-label">date range (optional)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div className="section-label">from</div>
              <input className="input" type="date" value={from}
                onChange={e => setFrom(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
            <div>
              <div className="section-label">to</div>
              <input className="input" type="date" value={to}
                onChange={e => setTo(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
            CSV export includes all transactions with date, description, category, amount, and wallet.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--subtle)' }}>
            leave dates empty to export everything
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleExport}
          disabled={loading}
          style={{ height: 48, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.08em' }}
        >
          {loading ? 'preparing...' : 'download csv'}
        </button>
      </div>
    </div>
  );
}