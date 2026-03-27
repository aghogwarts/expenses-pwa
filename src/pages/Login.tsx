import { useState } from 'react';
import { auth } from '../api/client';

interface Props {
  onLogin: (token: string) => void;
}

export function Login({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login(password);
      onLogin(res.data.access_token);
    } catch {
      setError('Wrong password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 24,
          fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6,
        }}>
          paisa<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          your personal expense log
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ marginBottom: 12 }}>
          <input
            className="input"
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
          />
        </div>
        {error && (
          <div style={{
            fontSize: 12, color: 'var(--danger)',
            fontFamily: 'var(--font-mono)', marginBottom: 10,
          }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading || !password}
        >
          {loading ? 'checking...' : 'enter'}
        </button>
      </form>
    </div>
  );
}