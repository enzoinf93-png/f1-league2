import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { leaguesApi } from '../api/leagues';
import { standingsApi } from '../api/predictions';
import { grandsPrixApi } from '../api/grandsPrix';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

interface Member { id: string; username: string; email: string; }
interface LeagueData {
  id: string; name: string; inviteCode: string;
  admin: { id: string; username: string };
  members: { user: Member }[];
  scoringConfig: Record<string, number> | null;
}
interface Standing { position: number; userId: string; username: string; totalPoints: number; }
interface GrandPrix { id: string; name: string; round: number; isResultEntered: boolean; }

export default function LeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const [league, setLeague] = useState<LeagueData | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [gps, setGps] = useState<GrandPrix[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      leaguesApi.getById(id),
      standingsApi.getLeague(id),
      grandsPrixApi.getAll(),
    ]).then(([l, s, g]) => {
      setLeague(l.data);
      setStandings(s.data);
      setGps(g.data.filter((gp: GrandPrix & { year: number }) => gp.year === 2026).sort((a: GrandPrix, b: GrandPrix) => a.round - b.round));
    }).finally(() => setLoading(false));
  }, [id]);

  const copyInviteLink = () => {
    if (!league) return;
    const link = `${window.location.origin}/join/${league.inviteCode}`;
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const refreshInvite = async () => {
    if (!id) return;
    const res = await leaguesApi.refreshInvite(id);
    setLeague((prev) => prev ? { ...prev, inviteCode: res.data.inviteCode } : prev);
  };

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="flex items-center justify-center py-20 text-gray-400">Caricamento...</div>
    </div>
  );

  if (!league) return null;

  const isLeagueAdmin = league.admin.id === user?.id || isAdmin;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 no-underline">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-white mt-1">{league.name}</h1>
            <p className="text-gray-500 text-sm">Admin: {league.admin.username} · {league.members.length} iscritti</p>
          </div>
          {isLeagueAdmin && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={copyInviteLink}
                className="px-4 py-2 rounded text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: copied ? '#15803d' : '#2a2a3e', border: '1px solid #3a3a5e' }}>
                {copied ? 'Link copiato!' : 'Copia link invito'}
              </button>
              <button onClick={refreshInvite}
                className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white transition-colors"
                style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e' }}>
                Rigenera link
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4">Classifica</h2>
            {standings.length === 0 ? (
              <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                <p className="text-gray-500 text-sm">Nessun punteggio ancora — inserisci le previsioni!</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2a2a3e' }}>
                {standings.map((s, i) => (
                  <div key={s.userId}
                    className="flex items-center gap-4 px-4 py-3 transition-colors"
                    style={{
                      backgroundColor: s.userId === user?.id ? '#1a1a2e' : i % 2 === 0 ? '#1e1e2e' : '#16162a',
                      borderBottom: i < standings.length - 1 ? '1px solid #2a2a3e' : 'none',
                    }}>
                    <span className="w-8 text-center font-bold text-lg"
                      style={{ color: i === 0 ? '#facc15' : i === 1 ? '#9ca3af' : i === 2 ? '#92400e' : '#4b5563' }}>
                      {s.position}
                    </span>
                    <span className="flex-1 font-semibold text-white text-sm">{s.username}
                      {s.userId === user?.id && <span className="text-xs text-gray-500 ml-2">(tu)</span>}
                    </span>
                    <span className="font-bold text-lg" style={{ color: '#e10600' }}>{s.totalPoints} <span className="text-xs text-gray-500 font-normal">pt</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-4">Prossimi GP</h2>
            <div className="space-y-2">
              {gps.slice(0, 8).map((gp) => (
                <div key={gp.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                  <span className="text-sm text-white truncate">{gp.name.replace(' Grand Prix', ' GP')}</span>
                  {gp.isResultEntered ? (
                    <Link to={`/gp/${gp.id}/results`}
                      className="text-xs no-underline"
                      style={{ color: '#4ade80' }}>
                      Risultati
                    </Link>
                  ) : (
                    <Link to={`/gp/${gp.id}/predict`}
                      className="text-xs no-underline text-gray-400 hover:text-white transition-colors">
                      Prevedi →
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold text-white mb-4 mt-6">Iscritti</h2>
            <div className="space-y-2">
              {league.members.map((m) => (
                <div key={m.user.id} className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: '#e10600' }}>
                    {m.user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white">{m.user.username}
                    {m.user.id === league.admin.id && <span className="text-xs text-yellow-500 ml-1">★</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
