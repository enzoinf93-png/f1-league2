import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { grandsPrixApi } from '../api/grandsPrix';
import { predictionsApi, standingsApi } from '../api/predictions';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { leaguesApi } from '../api/leagues';
import { F1_DRIVERS_2025 } from '../components/f1Data';

interface GrandPrix { id: string; name: string; qualifyingStart: string; isResultEntered: boolean; hasSprint: boolean; }
interface Result { type: string; value: string; }
interface GpStanding { position: number; userId: string; username: string; points: number; breakdown: Record<string, number>; }
interface League { id: string; name: string; }

const TYPE_LABELS: Record<string, string> = {
  P1: '1° Posto', P2: '2° Posto', P3: '3° Posto', PODIO_BONUS: 'Bonus Podio',
  POLE: 'Pole Position', FASTEST_LAP: 'Giro Veloce', SAFETY_CAR: 'Safety Car',
  FIRST_RETIREMENT: 'Primo Ritiro', CONSTRUCTOR_WINNER: 'Vincitore Costruttori',
  FASTEST_PIT_STOP: 'Pit Stop più Veloce',
  SPRINT_POLE: 'Pole Sprint', SPRINT_P1: '1° Sprint', SPRINT_P2: '2° Sprint',
  SPRINT_P3: '3° Sprint', SPRINT_PODIO_BONUS: 'Bonus Podio Sprint',
};

const BASE_RESULT_TYPES = ['P1','P2','P3','POLE','FASTEST_LAP','SAFETY_CAR','FIRST_RETIREMENT','CONSTRUCTOR_WINNER','FASTEST_PIT_STOP'];
const SPRINT_RESULT_TYPES = ['SPRINT_POLE','SPRINT_P1','SPRINT_P2','SPRINT_P3'];

function driverName(code: string) {
  return F1_DRIVERS_2025.find((d) => d.code === code)?.name || code;
}

function resultLabel(type: string, value: string) {
  if (type === 'SAFETY_CAR') return value === 'SI' ? 'Sì' : 'No';
  if (type === 'CONSTRUCTOR_WINNER') return value;
  return `${driverName(value)} (${value})`;
}

export default function GpResults() {
  const { gpId } = useParams<{ gpId: string }>();
  const { user } = useAuth();
  const [gp, setGp] = useState<GrandPrix | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [myPredictions, setMyPredictions] = useState<Result[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [standings, setStandings] = useState<GpStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gpId) return;
    Promise.all([
      grandsPrixApi.getById(gpId),
      grandsPrixApi.getResults(gpId),
      predictionsApi.getMy(gpId),
      leaguesApi.getMyLeagues(),
    ]).then(([gpRes, resRes, predRes, lgRes]) => {
      setGp(gpRes.data);
      setResults(resRes.data);
      setMyPredictions(predRes.data);
      setLeagues(lgRes.data);
      if (lgRes.data.length > 0) setSelectedLeague(lgRes.data[0].id);
    }).finally(() => setLoading(false));
  }, [gpId]);

  useEffect(() => {
    if (selectedLeague && gpId) {
      standingsApi.getGp(selectedLeague, gpId).then((r) => setStandings(r.data)).catch(() => setStandings([]));
    }
  }, [selectedLeague, gpId]);

  if (loading) return <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}><Navbar /><div className="flex items-center justify-center py-20 text-gray-400">Caricamento...</div></div>;
  if (!gp) return null;

  const resultMap = new Map(results.map((r) => [r.type, r.value]));
  const predMap = new Map(myPredictions.map((p) => [p.type, p.value]));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 no-underline">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-white mt-2 mb-1">{gp.name}</h1>
        <p className="text-sm text-gray-400 mb-8">Risultati e punteggi</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="p-5 rounded-lg" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
            <h2 className="font-bold text-white mb-4">Confronto previsioni</h2>
            {results.length === 0 ? (
              <p className="text-gray-500 text-sm">Nessun risultato ancora inserito</p>
            ) : (
              <div className="space-y-3">
                {[...BASE_RESULT_TYPES, ...(gp.hasSprint ? SPRINT_RESULT_TYPES : [])].map((type) => {
                  const actual = resultMap.get(type);
                  const pred = predMap.get(type);
                  if (!actual) return null;
                  const correct = pred === actual;
                  const isSprint = SPRINT_RESULT_TYPES.includes(type);
                  return (
                    <div key={type} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-400 w-36 shrink-0" style={isSprint ? { color: '#c084fc' } : {}}>
                        {TYPE_LABELS[type]}
                      </span>
                      <span className="text-white font-semibold flex-1 text-right">{resultLabel(type, actual)}</span>
                      {pred ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full ml-2 shrink-0 ${correct ? 'text-green-400' : 'text-red-400'}`}
                          style={{ backgroundColor: correct ? '#1a3a1a' : '#3b1a1a' }}>
                          {correct ? '✓' : `✗ ${resultLabel(type, pred)}`}
                        </span>
                      ) : <span className="text-gray-600 text-xs ml-2 shrink-0">—</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            {leagues.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <h2 className="font-bold text-white">Classifica GP</h2>
                  {leagues.length > 1 && (
                    <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}
                      className="text-sm px-3 py-1 rounded text-white outline-none"
                      style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e' }}>
                      {leagues.map((l: League) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  )}
                </div>
                {standings.length === 0 ? (
                  <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                    <p className="text-gray-500 text-sm">Nessun punteggio ancora calcolato</p>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2a2a3e' }}>
                    {standings.map((s, i) => (
                      <div key={s.userId} className="flex items-center gap-3 px-4 py-3"
                        style={{ backgroundColor: s.userId === user?.id ? '#1a1a2e' : i % 2 === 0 ? '#1e1e2e' : '#16162a', borderBottom: i < standings.length - 1 ? '1px solid #2a2a3e' : 'none' }}>
                        <span className="w-6 text-center font-bold" style={{ color: i === 0 ? '#facc15' : '#4b5563' }}>{s.position}</span>
                        <span className="flex-1 text-sm text-white">{s.username}</span>
                        <span className="font-bold" style={{ color: '#e10600' }}>{s.points}pt</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
