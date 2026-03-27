import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { path: '/',        label: 'Home'    },
  { path: '/add',     label: 'Add'     },
  { path: '/wallets', label: 'Wallets' },
  { path: '/history', label: 'History' },
  { path: '/export',  label: 'Export'  },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      height: 'var(--nav-h)',
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      display: 'flex', zIndex: 50,
    }}>
      {TABS.map(tab => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1, border: 'none', background: 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 4, height: 4, borderRadius: '50%',
              background: active ? 'var(--accent)' : 'transparent',
              transition: 'background 0.15s',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: active ? 'var(--accent)' : 'var(--muted)',
              transition: 'color 0.15s',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}