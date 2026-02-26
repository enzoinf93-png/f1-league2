import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { grandsPrixApi } from '../api/grandsPrix';
import { predictionsApi } from '../api/predictions';
import Navbar from '../components/Navbar';
import { F1_DRIVERS_2025, F1_CONSTRUCTORS_2025 } from '../components/f1Data';

interface GrandPrix {
  id: string; name: string; country: string;
  qualifyingStart: string; raceStart: string;
  isResultEntered: boolean; hasSprint: boolean;
}
interface Prediction { type: string; value: string; }

const BASE_TYPES    = ['P1','P2','P3','POLE','FASTEST_LAP','SAFETY_CAR','FIRST_RETIREMENT','CONSTRUCTOR_WINNER'];
const SPRINT_TYPES  = ['SPRINT_POLE','SPRINT_P1','SPRINT_P2','SPRINT_P3','FASTEST_PIT_STOP'];

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
}

function DriverSelect({ value, onChange, label, disabled = false, exclude = [] }: {
  value: string; onChange: (v: string) => void; label: string; disabled?: boolean; exclude?: string[];
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="w-full px-3 py-2 rounded text-sm outline-none appearance-none"
        style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', color: value ? '#fff' : '#6b7280', opacity: disabled ? 0.5 : 1 }}
      >
        <option value="">— Seleziona pilota —</option>
        {F1_DRIVERS_2025.filter((d) => !exclude.includes(d.code) || d.code === value).map((d) => (
          <option key={d.code} value={d.code}>{d.name} ({d.team})</option>
        ))}
      </select>
    </div>
  );
}

function Card({ title, pts, locked, children }: { title: string; pts: string; locked: boolean; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e', opacity: locked ? 0.7 : 1 }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white">{title}</h3>
        <span className="text-xs text-gray-500">{pts}</span>
      </div>
      {children}
    </div>
  );
}

export default function GpPredict() {
  const { gpId } = useParams<{ gpId: string }>();
  const [gp, setGp] = useState<GrandPrix | null>(null);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const deadline = gp ? new Date(new Date(gp.qualifyingStart).getTime() - 10 * 60 * 1000) : new Date(0);
  const countdown = useCountdown(deadline);
  const isLocked = !countdown;

  useEffect(() => {
    if (!gpId) return;
    Promise.all([grandsPrixApi.getById(gpId), predictionsApi.getMy(gpId)])
      .then(([gpRes, predRes]) => {
        setGp(gpRes.data);
        const m: Record<string, string> = {};
        predRes.data.forEach((p: Prediction) => { m[p.type] = p.value; });
        setPredictions(m);
      }).finally(() => setLoading(false));
  }, [gpId]);

  const set = useCallback((type: string, value: string) => {
    setPredictions((prev) => ({ ...prev, [type]: value }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    if (!gpId) return;
    setSaving(true); setError('');
    try {
      const allTypes = gp?.hasSprint ? [...BASE_TYPES, ...SPRINT_TYPES] : BASE_TYPES;
      const toSave = allTypes.filter((t) => predictions[t]).map((t) => ({ type: t, value: predictions[t] }));
      await predictionsApi.save(gpId, toSave);
      setSaved(true);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar /><div className="flex items-center justify-center py-20 text-gray-400">Caricamento...</div>
    </div>
  );
  if (!gp) return null;

  const p = predictions;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 no-underline">← Dashboard</Link>
        <div className="mt-2 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{gp.name}</h1>
            {gp.hasSprint && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ backgroundColor: '#2a1a3e', color: '#c084fc', border: '1px solid #6b21a8' }}>
                Sprint Weekend
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-sm text-gray-400">
              Qualifiche: {new Date(gp.qualifyingStart).toLocaleString('it-IT')}
            </span>
            {isLocked ? (
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#3b1a1a', color: '#f87171' }}>
                PREVISIONI CHIUSE
              </span>
            ) : (
              <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#1a2a1a', color: '#4ade80' }}>
                Chiude tra: <strong>{countdown}</strong>
              </span>
            )}
          </div>
        </div>

        {isLocked && (
          <div className="mb-6 p-4 rounded-lg text-sm" style={{ backgroundColor: '#3b1a1a', border: '1px solid #7f1d1d', color: '#f87171' }}>
            Le previsioni sono chiuse — le qualifiche iniziano tra meno di 10 minuti.
          </div>
        )}

        {/* ── SEZIONE GARA ── */}
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 mt-2">Gara Principale</p>
        <div className="space-y-4">

          <Card title="1. Podio Completo" pts="P1=10pt · P2=7pt · P3=5pt · Bonus=5pt" locked={isLocked}>
            <div className="space-y-3">
              <DriverSelect label="1° posto" value={p['P1']||''} onChange={(v)=>set('P1',v)} disabled={isLocked}
                exclude={[p['P2'],p['P3']].filter(Boolean)} />
              <DriverSelect label="2° posto" value={p['P2']||''} onChange={(v)=>set('P2',v)} disabled={isLocked}
                exclude={[p['P1'],p['P3']].filter(Boolean)} />
              <DriverSelect label="3° posto" value={p['P3']||''} onChange={(v)=>set('P3',v)} disabled={isLocked}
                exclude={[p['P1'],p['P2']].filter(Boolean)} />
            </div>
          </Card>

          <Card title="2. Pole Position" pts="5pt" locked={isLocked}>
            <DriverSelect label="Pilota" value={p['POLE']||''} onChange={(v)=>set('POLE',v)} disabled={isLocked} />
          </Card>

          <Card title="3. Giro Veloce" pts="5pt" locked={isLocked}>
            <DriverSelect label="Pilota" value={p['FASTEST_LAP']||''} onChange={(v)=>set('FASTEST_LAP',v)} disabled={isLocked} />
          </Card>

          <Card title="4. Primo Ritiro" pts="8pt" locked={isLocked}>
            <DriverSelect label="Pilota" value={p['FIRST_RETIREMENT']||''} onChange={(v)=>set('FIRST_RETIREMENT',v)} disabled={isLocked} />
          </Card>

          <Card title="5. Safety Car" pts="3pt" locked={isLocked}>
            <div className="flex gap-3">
              {['SI','NO'].map((opt) => (
                <button key={opt} onClick={() => !isLocked && set('SAFETY_CAR', opt)} disabled={isLocked}
                  className="flex-1 py-3 rounded font-bold text-sm transition-all"
                  style={{
                    backgroundColor: p['SAFETY_CAR'] === opt ? '#e10600' : '#2a2a3e',
                    border: `1px solid ${p['SAFETY_CAR'] === opt ? '#e10600' : '#3a3a5e'}`,
                    color: '#fff', cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.5 : 1,
                  }}>
                  {opt === 'SI' ? 'Sì, ci sarà' : 'No, non ci sarà'}
                </button>
              ))}
            </div>
          </Card>

          <Card title="6. Vincitore Costruttori del Weekend" pts="4pt" locked={isLocked}>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Costruttore</label>
              <select value={p['CONSTRUCTOR_WINNER']||''} onChange={(e)=>!isLocked&&set('CONSTRUCTOR_WINNER',e.target.value)}
                disabled={isLocked} className="w-full px-3 py-2 rounded text-sm outline-none appearance-none"
                style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', color: '#fff', opacity: isLocked ? 0.5 : 1 }}>
                <option value="">— Seleziona costruttore —</option>
                {F1_CONSTRUCTORS_2025.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Card>

          <Card title="7. Scuderia Pit Stop più Veloce" pts="4pt" locked={isLocked}>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Costruttore</label>
              <select value={p['FASTEST_PIT_STOP']||''} onChange={(e)=>!isLocked&&set('FASTEST_PIT_STOP',e.target.value)}
                disabled={isLocked} className="w-full px-3 py-2 rounded text-sm outline-none appearance-none"
                style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', color: '#fff', opacity: isLocked ? 0.5 : 1 }}>
                <option value="">— Seleziona costruttore —</option>
                {F1_CONSTRUCTORS_2025.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Card>
        </div>

        {/* ── SEZIONE SPRINT (solo sprint weekend) ── */}
        {gp.hasSprint && (
          <>
            <div className="flex items-center gap-3 mt-8 mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Sprint Race</p>
              <div className="flex-1 h-px" style={{ backgroundColor: '#6b21a8' }} />
            </div>
            <div className="space-y-4">

              <Card title="S1. Pole Position Sprint" pts="3pt" locked={isLocked}>
                <DriverSelect label="Pilota" value={p['SPRINT_POLE']||''} onChange={(v)=>set('SPRINT_POLE',v)} disabled={isLocked} />
              </Card>

              <Card title="S2. Podio Sprint" pts="P1=7pt · P2=5pt · P3=3pt · Bonus=3pt" locked={isLocked}>
                <div className="space-y-3">
                  <DriverSelect label="1° Sprint" value={p['SPRINT_P1']||''} onChange={(v)=>set('SPRINT_P1',v)} disabled={isLocked}
                    exclude={[p['SPRINT_P2'],p['SPRINT_P3']].filter(Boolean)} />
                  <DriverSelect label="2° Sprint" value={p['SPRINT_P2']||''} onChange={(v)=>set('SPRINT_P2',v)} disabled={isLocked}
                    exclude={[p['SPRINT_P1'],p['SPRINT_P3']].filter(Boolean)} />
                  <DriverSelect label="3° Sprint" value={p['SPRINT_P3']||''} onChange={(v)=>set('SPRINT_P3',v)} disabled={isLocked}
                    exclude={[p['SPRINT_P1'],p['SPRINT_P2']].filter(Boolean)} />
                </div>
              </Card>

            </div>
          </>
        )}

        {error && (
          <div className="mt-4 p-3 rounded text-sm text-red-400" style={{ backgroundColor: '#3b1a1a', border: '1px solid #7f1d1d' }}>
            {error}
          </div>
        )}
        {saved && (
          <div className="mt-4 p-3 rounded text-sm text-green-400" style={{ backgroundColor: '#1a3a1a', border: '1px solid #14532d' }}>
            Previsioni salvate correttamente!
          </div>
        )}

        <button onClick={handleSave} disabled={isLocked || saving}
          className="w-full mt-6 py-3 rounded font-bold text-white text-sm tracking-wider"
          style={{ backgroundColor: isLocked ? '#4b5563' : '#e10600', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
          {saving ? 'SALVATAGGIO...' : isLocked ? 'PREVISIONI CHIUSE' : 'SALVA PREVISIONI'}
        </button>
      </div>
    </div>
  );
}
