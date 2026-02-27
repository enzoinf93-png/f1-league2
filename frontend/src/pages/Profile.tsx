import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currPwd, setCurrPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [delPwd, setDelPwd] = useState('');
  const [delLoading, setDelLoading] = useState(false);
  const [delError, setDelError] = useState('');
  const [showDelConfirm, setShowDelConfirm] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdError('Le nuove password non coincidono'); return; }
    setPwdLoading(true); setPwdError(''); setPwdSuccess('');
    try {
      await authApi.changePassword({ currentPassword: currPwd, newPassword: newPwd });
      setPwdSuccess('Password aggiornata con successo!');
      setCurrPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) {
      setPwdError(e.response?.data?.error || 'Errore nel cambio password');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDelLoading(true); setDelError('');
    try {
      await authApi.deleteAccount({ password: delPwd });
      logout();
      navigate('/login');
    } catch (e: any) {
      setDelError(e.response?.data?.error || 'Errore nell\'eliminazione');
      setDelLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e',
    color: '#fff', borderRadius: '6px', padding: '10px 14px',
    width: '100%', outline: 'none', fontSize: '14px',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 no-underline">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-white mt-2 mb-1">Il mio profilo</h1>
        <p className="text-sm text-gray-400 mb-8">
          <span className="text-white font-semibold">{user?.username}</span> · {user?.email}
        </p>

        {/* Cambio password */}
        <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
          <h2 className="text-base font-bold text-white mb-4">Cambia password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Password attuale</label>
              <input type="password" value={currPwd} onChange={e => setCurrPwd(e.target.value)}
                style={inputStyle} required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nuova password</label>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                style={inputStyle} required minLength={6} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Conferma nuova password</label>
              <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                style={inputStyle} required />
            </div>
            {pwdError && <p className="text-sm text-red-400">{pwdError}</p>}
            {pwdSuccess && <p className="text-sm text-green-400">{pwdSuccess}</p>}
            <button type="submit" disabled={pwdLoading}
              className="w-full py-2 rounded font-bold text-white text-sm"
              style={{ backgroundColor: pwdLoading ? '#4b5563' : '#e10600', cursor: pwdLoading ? 'not-allowed' : 'pointer' }}>
              {pwdLoading ? 'AGGIORNAMENTO...' : 'AGGIORNA PASSWORD'}
            </button>
          </form>
        </div>

        {/* Elimina account */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#1e1e2e', border: '1px solid #7f1d1d' }}>
          <h2 className="text-base font-bold text-red-400 mb-2">Elimina account</h2>
          <p className="text-xs text-gray-400 mb-4">
            Questa azione è irreversibile. Verranno eliminati previsioni, punteggi e iscrizioni alle leghe.
          </p>
          {!showDelConfirm ? (
            <button onClick={() => setShowDelConfirm(true)}
              className="w-full py-2 rounded font-bold text-sm"
              style={{ backgroundColor: '#3b1a1a', border: '1px solid #7f1d1d', color: '#f87171', cursor: 'pointer' }}>
              ELIMINA IL MIO ACCOUNT
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Inserisci la tua password per confermare</label>
                <input type="password" value={delPwd} onChange={e => setDelPwd(e.target.value)}
                  style={inputStyle} placeholder="Password" />
              </div>
              {delError && <p className="text-sm text-red-400">{delError}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setShowDelConfirm(false); setDelPwd(''); setDelError(''); }}
                  className="flex-1 py-2 rounded text-sm font-bold text-gray-300"
                  style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', cursor: 'pointer' }}>
                  ANNULLA
                </button>
                <button onClick={handleDeleteAccount} disabled={delLoading || !delPwd}
                  className="flex-1 py-2 rounded text-sm font-bold"
                  style={{ backgroundColor: '#7f1d1d', color: '#fff', cursor: delLoading || !delPwd ? 'not-allowed' : 'pointer', opacity: !delPwd ? 0.5 : 1 }}>
                  {delLoading ? 'ELIMINAZIONE...' : 'CONFERMA ELIMINA'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
