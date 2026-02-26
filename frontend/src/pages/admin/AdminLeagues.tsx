import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaguesApi } from '../../api/leagues';
import Navbar from '../../components/Navbar';

interface League { id: string; name: string; inviteCode: string; _count?: { members: number }; createdAt: string; }

export default function AdminLeagues() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaguesApi.getAdminLeagues().then((r) => setLeagues(r.data)).finally(() => setLoading(false));
  }, []);

  const createLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await leaguesApi.create(newName.trim());
      setLeagues((prev) => [...prev, res.data]);
      setNewName('');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Errore creazione lega');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (league: League) => {
    const link = `${window.location.origin}/join/${league.inviteCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(league.id);
      setTimeout(() => setCopiedId(''), 2000);
    });
  };

  const refreshCode = async (league: League) => {
    const res = await leaguesApi.refreshInvite(league.id);
    setLeagues((prev) => prev.map((l) => l.id === league.id ? { ...l, inviteCode: res.data.inviteCode } : l));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 no-underline">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-white">Gestione Leghe</h1>
        </div>

        <div className="p-5 rounded-lg mb-8" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
          <h2 className="font-bold text-white mb-4">Crea nuova lega</h2>
          {error && <div className="mb-3 p-2 rounded text-sm text-red-400" style={{ backgroundColor: '#3b1a1a' }}>{error}</div>}
          <form onSubmit={createLeague} className="flex gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome della lega"
              className="flex-1 px-4 py-2 rounded text-white text-sm outline-none"
              style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', color: '#fff' }}
            />
            <button type="submit" disabled={creating || !newName.trim()}
              className="px-5 py-2 rounded font-bold text-white text-sm"
              style={{ backgroundColor: '#e10600' }}>
              {creating ? '...' : 'Crea'}
            </button>
          </form>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Caricamento...</p>
        ) : leagues.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Nessuna lega creata</p>
        ) : (
          <div className="space-y-4">
            {leagues.map((league) => (
              <div key={league.id} className="p-5 rounded-lg" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-white">{league.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Creata il {new Date(league.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <Link to={`/leagues/${league.id}`}
                    className="text-xs text-gray-400 hover:text-white no-underline transition-colors">
                    Visualizza lega →
                  </Link>
                </div>
                <div className="p-3 rounded text-xs font-mono text-gray-400 mb-3 break-all"
                  style={{ backgroundColor: '#0f0f1a', border: '1px solid #2a2a3e' }}>
                  {`${window.location.origin}/join/${league.inviteCode}`}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => copyLink(league)}
                    className="px-3 py-1.5 rounded text-sm font-semibold transition-colors"
                    style={{ backgroundColor: copiedId === league.id ? '#15803d' : '#2a2a3e', border: '1px solid #3a3a5e', color: '#fff' }}>
                    {copiedId === league.id ? 'Copiato!' : 'Copia link invito'}
                  </button>
                  <button onClick={() => refreshCode(league)}
                    className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white transition-colors"
                    style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e' }}>
                    Rigenera link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
