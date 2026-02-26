import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { grandsPrixApi } from '../../api/grandsPrix';
import Navbar from '../../components/Navbar';
import { F1_DRIVERS_2025, F1_CONSTRUCTORS_2025 } from '../../components/f1Data';

interface GrandPrix { id: string; name: string; isResultEntered: boolean; hasSprint: boolean; }

const BASE_SLOTS = [
  { type: 'P1',                label: '1° Posto (Vincitore Gara)',   kind: 'driver'      as const },
  { type: 'P2',                label: '2° Posto',                    kind: 'driver'      as const },
  { type: 'P3',                label: '3° Posto',                    kind: 'driver'      as const },
  { type: 'POLE',              label: 'Pole Position',               kind: 'driver'      as const },
  { type: 'FASTEST_LAP',       label: 'Giro Veloce',                 kind: 'driver'      as const },
  { type: 'SAFETY_CAR',        label: 'Safety Car',                  kind: 'yesno'       as const },
  { type: 'FIRST_RETIREMENT',  label: 'Primo Ritiro',                kind: 'driver'      as const },
  { type: 'CONSTRUCTOR_WINNER',label: 'Vincitore Costruttori',       kind: 'constructor' as const },
  { type: 'FASTEST_PIT_STOP',  label: 'Pit Stop più Veloce',         kind: 'constructor' as const },
];

const SPRINT_SLOTS = [
  { type: 'SPRINT_POLE', label: 'Pole Position Sprint', kind: 'driver' as const },
  { type: 'SPRINT_P1',   label: '1° Sprint',            kind: 'driver' as const },
  { type: 'SPRINT_P2',   label: '2° Sprint',            kind: 'driver' as const },
  { type: 'SPRINT_P3',   label: '3° Sprint',            kind: 'driver' as const },
];

export default function AdminGpResults() {
  const { gpId } = useParams<{ gpId: string }>();
  const navigate = useNavigate();
  const [gp, setGp] = useState<GrandPrix | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gpId) return;
    Promise.all([grandsPrixApi.getById(gpId), grandsPrixApi.getResults(gpId)])
      .then(([gpRes, resRes]) => {
        setGp(gpRes.data);
        const map: Record<string, string> = {};
        resRes.data.forEach((r: { type: string; value: string }) => { map[r.type] = r.value; });
        setValues(map);
      }).finally(() => setLoading(false));
  }, [gpId]);

  const handleSave = async () => {
    if (!gpId || !gp) return;
    setSaving(true); setError('');
    try {
      const allSlots = gp.hasSprint ? [...BASE_SLOTS, ...SPRINT_SLOTS] : BASE_SLOTS;
      const missing = allSlots.filter((s) => !values[s.type]).map((s) => s.label);
      if (missing.length > 0) {
        setError(`Campi mancanti: ${missing.join(', ')}`);
        setSaving(false);
        return;
      }
      const results = allSlots.map((s) => ({ type: s.type, value: values[s.type] }));
      await grandsPrixApi.enterResults(gpId, results);
      navigate('/admin/grands-prix');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Errore salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const set = (type: string, value: string) => setValues((prev) => ({ ...prev, [type]: value }));

  const selectCls = 'w-full px-3 py-2 rounded text-white text-sm outline-none appearance-none';
  const selectStyle = { backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', color: '#fff' };

  const renderSlot = (slot: typeof BASE_SLOTS[number]) => (
    <div key={slot.type} className="p-5 rounded-lg" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
      <label className="block font-semibold text-white mb-3">{slot.label}</label>
      {slot.kind === 'driver' && (
        <select value={values[slot.type]||''} onChange={(e)=>set(slot.type,e.target.value)} className={selectCls} style={selectStyle}>
          <option value="">— Seleziona pilota —</option>
          {F1_DRIVERS_2025.map((d) => <option key={d.code} value={d.code}>{d.name} ({d.team})</option>)}
        </select>
      )}
      {slot.kind === 'yesno' && (
        <div className="flex gap-3">
          {['SI','NO'].map((opt) => (
            <button key={opt} onClick={()=>set(slot.type,opt)}
              className="flex-1 py-2 rounded font-bold text-sm"
              style={{ backgroundColor: values[slot.type]===opt?'#e10600':'#2a2a3e', border:`1px solid ${values[slot.type]===opt?'#e10600':'#3a3a5e'}`, color:'#fff', cursor:'pointer' }}>
              {opt==='SI'?'Sì':'No'}
            </button>
          ))}
        </div>
      )}
      {slot.kind === 'constructor' && (
        <select value={values[slot.type]||''} onChange={(e)=>set(slot.type,e.target.value)} className={selectCls} style={selectStyle}>
          <option value="">— Seleziona costruttore —</option>
          {F1_CONSTRUCTORS_2025.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
    </div>
  );

  if (loading) return <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}><Navbar /><div className="flex items-center justify-center py-20 text-gray-400">Caricamento...</div></div>;
  if (!gp) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/admin/grands-prix" className="text-xs text-gray-500 hover:text-gray-300 no-underline">← Gestione GP</Link>
        <div className="flex items-center gap-3 mt-2 mb-1 flex-wrap">
          <h1 className="text-2xl font-bold text-white">{gp.name}</h1>
          {gp.hasSprint && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ backgroundColor: '#2a1a3e', color: '#c084fc', border: '1px solid #6b21a8' }}>
              Sprint Weekend
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-8">Inserisci i risultati ufficiali</p>

        {gp.isResultEntered && (
          <div className="mb-6 p-3 rounded text-sm text-yellow-400" style={{ backgroundColor: '#2a2a1a', border: '1px solid #78350f' }}>
            Risultati già inseriti. Puoi comunque aggiornarli.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded text-sm text-red-400" style={{ backgroundColor: '#3b1a1a', border: '1px solid #7f1d1d' }}>{error}</div>
        )}

        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Gara Principale</p>
        <div className="space-y-4">
          {BASE_SLOTS.map(renderSlot)}
        </div>

        {gp.hasSprint && (
          <>
            <div className="flex items-center gap-3 mt-8 mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Sprint Race</p>
              <div className="flex-1 h-px" style={{ backgroundColor: '#6b21a8' }} />
            </div>
            <div className="space-y-4">
              {SPRINT_SLOTS.map(renderSlot)}
            </div>
          </>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full mt-8 py-3 rounded font-bold text-white text-sm tracking-wider"
          style={{ backgroundColor: '#e10600' }}>
          {saving ? 'SALVATAGGIO E CALCOLO PUNTEGGI...' : 'SALVA RISULTATI E CALCOLA PUNTEGGI'}
        </button>
      </div>
    </div>
  );
}
