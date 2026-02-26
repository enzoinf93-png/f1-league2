import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaguesApi } from '../api/leagues';
import { grandsPrixApi } from '../api/grandsPrix';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

interface League { id: string; name: string; admin: { username: string }; memberCount: number; }
interface GrandPrix { id: string; name: string; country: string; round: number; qualifyingStart: string; raceStart: string; isResultEntered: boolean; year: number; }

function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'Australia': '🇦🇺', 'China': '🇨🇳', 'Japan': '🇯🇵', 'Bahrain': '🇧🇭',
    'Saudi Arabia': '🇸🇦', 'USA': '🇺🇸', 'Italy': '🇮🇹', 'Monaco': '🇲🇨',
    'Spain': '🇪🇸', 'Canada': '🇨🇦', 'Austria': '🇦🇹', 'United Kingdom': '🇬🇧',
    'Belgium': '🇧🇪', 'Hungary': '🇭🇺', 'Netherlands': '🇳🇱', 'Azerbaijan': '🇦🇿',
    'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'UAE': '🇦🇪',
    'Qatar': '🇶🇦',
  };
  return flags[country] || '🏁';
}

function GpStatusBadge({ gp }: { gp: GrandPrix }) {
  const now = new Date();
  const qualifying = new Date(gp.qualifyingStart);
  const deadline = new Date(qualifying.getTime() - 10 * 60 * 1000);
  const isPast = now > new Date(gp.raceStart);

  if (gp.isResultEntered) return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#1a3a1a', color: '#4ade80' }}>RISULTATI</span>;
  if (isPast) return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#2a2a1a', color: '#facc15' }}>IN ATTESA</span>;
  if (now > deadline) return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#3a1a1a', color: '#f87171' }}>CHIUSE</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#1a2a3a', color: '#60a5fa' }}>APERTE</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [gps, setGps] = useState<GrandPrix[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [loadingGps, setLoadingGps] = useState(true);

  useEffect(() => {
    leaguesApi.getMyLeagues().then((r) => setLeagues(r.data)).finally(() => setLoadingLeagues(false));
    grandsPrixApi.getAll().then((r) => {
      const sorted = r.data.filter((g: GrandPrix) => g.year === 2026).sort((a: GrandPrix, b: GrandPrix) => a.round - b.round);
      setGps(sorted);
    }).finally(() => setLoadingGps(false));
  }, []);

  const nextGp = gps.find((g) => !g.isResultEntered && new Date(g.raceStart) > new Date());

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Ciao, <span style={{ color: '#e10600' }}>{user?.username}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Stagione F1 2026</p>
        </div>

        {nextGp && (
          <div className="mb-8 p-5 rounded-lg" style={{ backgroundColor: '#1e1e2e', border: '1px solid #e10600' }}>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Prossimo GP</p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {getCountryFlag(nextGp.country)} {nextGp.name}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Qualifiche: {new Date(nextGp.qualifyingStart).toLocaleString('it-IT')} &nbsp;|&nbsp;
                  Gara: {new Date(nextGp.raceStart).toLocaleString('it-IT')}
                </p>
              </div>
              <div className="flex gap-2">
                {leagues.slice(0, 1).map((l) => (
                  <Link key={l.id} to={`/gp/${nextGp.id}/predict`}
                    className="px-4 py-2 rounded font-bold text-sm text-white no-underline"
                    style={{ backgroundColor: '#e10600' }}>
                    INSERISCI PREVISIONI
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Le tue leghe</h2>
            </div>
            {loadingLeagues ? (
              <p className="text-gray-500 text-sm">Caricamento...</p>
            ) : leagues.length === 0 ? (
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                <p className="text-gray-500 text-sm">Non sei ancora in nessuna lega</p>
                <p className="text-gray-600 text-xs mt-1">Attendi il link di invito dall'admin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leagues.map((league) => (
                  <Link key={league.id} to={`/leagues/${league.id}`}
                    className="block p-4 rounded-lg no-underline transition-all hover:border-red-600"
                    style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                    <h3 className="font-bold text-white text-sm">{league.name}</h3>
                    <p className="text-gray-500 text-xs mt-1">
                      Admin: {league.admin?.username} · {league.memberCount} iscritti
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4">Calendario 2026</h2>
            {loadingGps ? (
              <p className="text-gray-500 text-sm">Caricamento...</p>
            ) : (
              <div className="space-y-2">
                {gps.map((gp) => (
                  <div key={gp.id} className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                    <span className="text-xs text-gray-500 w-6 text-right font-mono">{gp.round}</span>
                    <span className="text-lg">{getCountryFlag(gp.country)}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-white truncate block">{gp.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(gp.raceStart).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <GpStatusBadge gp={gp} />
                    {!gp.isResultEntered && new Date(gp.qualifyingStart) > new Date() && leagues.length > 0 && (
                      <Link to={`/gp/${gp.id}/predict`}
                        className="text-xs text-gray-400 hover:text-white no-underline transition-colors">
                        Prevedi →
                      </Link>
                    )}
                    {gp.isResultEntered && (
                      <Link to={`/gp/${gp.id}/results`}
                        className="text-xs text-gray-400 hover:text-white no-underline transition-colors">
                        Risultati →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
