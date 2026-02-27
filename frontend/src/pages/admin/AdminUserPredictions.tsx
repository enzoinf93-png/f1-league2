import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { grandsPrixApi } from '../../api/grandsPrix';
import { predictionsApi } from '../../api/predictions';
import Navbar from '../../components/Navbar';

interface GrandPrix { id: string; name: string; }
interface UserPrediction { type: string; value: string; }
interface UserEntry {
  userId: string;
  username: string;
  predictions: UserPrediction[];
}

const TYPE_LABELS: Record<string, string> = {
  P1: '1° Posto', P2: '2° Posto', P3: '3° Posto',
  POLE: 'Pole Position', FASTEST_LAP: 'Giro Veloce',
  SAFETY_CAR: 'Safety Car', FIRST_RETIREMENT: 'Primo Ritiro',
  CONSTRUCTOR_WINNER: 'Vincitore Costruttori', FASTEST_PIT_STOP: 'Pit Stop Veloce',
  SPRINT_POLE: 'Pole Sprint', SPRINT_P1: '1° Sprint', SPRINT_P2: '2° Sprint', SPRINT_P3: '3° Sprint',
};

export default function AdminUserPredictions() {
  const { gpId } = useParams<{ gpId: string }>();
  const [gp, setGp] = useState<GrandPrix | null>(null);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<string | null>(null);

  const load = () => {
    if (!gpId) return;
    Promise.all([grandsPrixApi.getById(gpId), predictionsApi.getAll(gpId)])
      .then(([gpRes, predsRes]) => {
        setGp(gpRes.data);
        const map: Record<string, UserEntry> = {};
        for (const p of predsRes.data) {
          if (!map[p.user.id]) map[p.user.id] = { userId: p.user.id, username: p.user.username, predictions: [] };
          map[p.user.id].predictions.push({ type: p.type, value: p.value });
        }
        setUsers(Object.values(map).sort((a, b) => a.username.localeCompare(b.username)));
      }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [gpId]);

  const handleDelete = async (userId: string) => {
    if (!gpId) return;
    setDeleting(userId);
    try {
      await predictionsApi.deleteUserPredictions(gpId, userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      setConfirmUser(null);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/admin/grands-prix" className="text-xs text-gray-500 hover:text-gray-300 no-underline">
          ← Gestione GP
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2 mb-1">
          Previsioni Utenti
        </h1>
        {gp && <p className="text-sm text-gray-400 mb-6">{gp.name}</p>}

        {loading ? (
          <p className="text-gray-400">Caricamento...</p>
        ) : users.length === 0 ? (
          <div className="p-6 rounded-lg text-center text-gray-400" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
            Nessuna previsione inserita per questo GP.
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.userId} className="p-5 rounded-lg" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white">{u.username}</span>
                  <span className="text-xs text-gray-500">{u.predictions.length} previsioni</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mb-4">
                  {u.predictions.map((p) => (
                    <div key={p.type} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">{TYPE_LABELS[p.type] ?? p.type}:</span>
                      <span className="text-white font-medium">{p.value}</span>
                    </div>
                  ))}
                </div>
                {confirmUser === u.userId ? (
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmUser(null)}
                      className="flex-1 py-1.5 rounded text-xs font-bold text-gray-300"
                      style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', cursor: 'pointer' }}>
                      ANNULLA
                    </button>
                    <button onClick={() => handleDelete(u.userId)} disabled={deleting === u.userId}
                      className="flex-1 py-1.5 rounded text-xs font-bold text-white"
                      style={{ backgroundColor: '#7f1d1d', cursor: 'pointer' }}>
                      {deleting === u.userId ? 'ELIMINANDO...' : 'CONFERMA ELIMINA'}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmUser(u.userId)}
                    className="w-full py-1.5 rounded text-xs font-bold"
                    style={{ backgroundColor: '#3b1a1a', border: '1px solid #7f1d1d', color: '#f87171', cursor: 'pointer' }}>
                    ELIMINA PREVISIONI
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
