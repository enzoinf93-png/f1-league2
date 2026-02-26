import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore di accesso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#15151e' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span style={{ color: '#e10600', fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px' }}>F1</span>
          <span className="text-white text-3xl font-bold ml-2 tracking-widest">LEAGUE</span>
          <p className="text-gray-400 mt-2 text-sm">Accedi al tuo account</p>
        </div>
        <div className="rounded-lg p-8 shadow-xl" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
          {error && (
            <div className="mb-4 p-3 rounded text-sm text-red-400" style={{ backgroundColor: '#3b1a1a', border: '1px solid #7f1d1d' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded text-white text-sm outline-none transition-all"
                style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', color: '#fff' }}
                placeholder="tua@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded text-white text-sm outline-none"
                style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', color: '#fff' }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-bold text-white text-sm tracking-wider transition-opacity"
              style={{ backgroundColor: '#e10600' }}
            >
              {loading ? 'ACCESSO...' : 'ACCEDI'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Non hai un account?{' '}
            <Link to="/register" className="text-red-500 hover:text-red-400 font-semibold no-underline">
              Registrati
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
