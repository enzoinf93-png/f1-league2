import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leaguesApi } from '../api/leagues';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

interface LeaguePreview { id: string; name: string; admin: { username: string }; memberCount: number; }

export default function JoinLeague() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<LeaguePreview | null>(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inviteCode) return;
    leaguesApi.previewInvite(inviteCode)
      .then((r) => setPreview(r.data))
      .catch((e) => setError(e.response?.data?.error || 'Link di invito non valido'))
      .finally(() => setLoading(false));
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!inviteCode) return;
    setJoining(true);
    try {
      const res = await leaguesApi.joinLeague(inviteCode);
      navigate(`/leagues/${res.data.leagueId}`);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Errore durante l\'iscrizione');
      setJoining(false);
    }
  };

  if (!user) return <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}><Navbar /><div className="flex items-center justify-center py-20 text-gray-400">Devi accedere prima</div></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏁</div>
          <h1 className="text-2xl font-bold text-white">Unisciti alla lega</h1>
        </div>
        <div className="p-8 rounded-lg" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
          {loading && <p className="text-center text-gray-400">Caricamento...</p>}
          {error && <div className="text-center"><p className="text-red-400 mb-4">{error}</p><Link to="/" className="text-gray-400 text-sm no-underline hover:text-white">← Torna alla dashboard</Link></div>}
          {preview && !error && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">{preview.name}</h2>
                <p className="text-gray-400 text-sm mt-1">Admin: {preview.admin.username}</p>
                <p className="text-gray-500 text-sm">{preview.memberCount} iscritti</p>
              </div>
              <p className="text-sm text-gray-400 text-center mb-6">
                Stai per iscriverti a questa lega come <span className="text-white font-semibold">{user.username}</span>
              </p>
              <button onClick={handleJoin} disabled={joining}
                className="w-full py-3 rounded font-bold text-white text-sm tracking-wider"
                style={{ backgroundColor: '#e10600' }}>
                {joining ? 'ISCRIZIONE...' : 'ISCRIVITI ALLA LEGA'}
              </button>
              <Link to="/" className="block text-center text-gray-500 text-sm mt-4 no-underline hover:text-gray-300">
                Annulla
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
