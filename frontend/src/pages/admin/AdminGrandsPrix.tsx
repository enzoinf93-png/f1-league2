import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { grandsPrixApi } from '../../api/grandsPrix';
import Navbar from '../../components/Navbar';

interface GrandPrix { id: string; name: string; country: string; round: number; year: number; qualifyingStart: string; raceStart: string; isResultEntered: boolean; }

export default function AdminGrandsPrix() {
  const [gps, setGps] = useState<GrandPrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ year: 2026, round: '', name: '', country: '', circuit: '', qualifyingStart: '', raceStart: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    grandsPrixApi.getAll().then((r) => setGps(r.data.sort((a: GrandPrix, b: GrandPrix) => a.round - b.round))).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await grandsPrixApi.create({
        ...form,
        year: Number(form.year),
        round: Number(form.round),
      });
      setGps((prev) => [...prev, res.data].sort((a, b) => a.round - b.round));
      setShowForm(false);
      setForm({ year: 2026, round: '', name: '', country: '', circuit: '', qualifyingStart: '', raceStart: '' });
    } catch (e: any) {
      setError(e.response?.data?.error || 'Errore creazione GP');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded text-white text-sm outline-none";
  const inputStyle = { backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e', color: '#fff' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#15151e' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 no-underline">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-white mt-1">Gestione Grand Prix</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded font-bold text-white text-sm"
            style={{ backgroundColor: showForm ? '#4b5563' : '#e10600' }}>
            {showForm ? 'Annulla' : '+ Aggiungi GP'}
          </button>
        </div>

        {showForm && (
          <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
            <h2 className="font-bold text-white mb-4">Nuovo Grand Prix</h2>
            {error && <div className="mb-3 p-2 rounded text-sm text-red-400" style={{ backgroundColor: '#3b1a1a' }}>{error}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              {[
                { label: 'Anno', key: 'year', type: 'number' },
                { label: 'Round #', key: 'round', type: 'number' },
                { label: 'Nome GP', key: 'name', type: 'text' },
                { label: 'Paese', key: 'country', type: 'text' },
                { label: 'Circuito', key: 'circuit', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key} className={key === 'name' || key === 'circuit' ? 'col-span-2' : ''}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input type={type} value={(form as any)[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    required className={inputCls} style={inputStyle} />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data/ora Qualifiche (UTC)</label>
                <input type="datetime-local" value={form.qualifyingStart}
                  onChange={(e) => setForm((p) => ({ ...p, qualifyingStart: e.target.value }))}
                  required className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data/ora Gara (UTC)</label>
                <input type="datetime-local" value={form.raceStart}
                  onChange={(e) => setForm((p) => ({ ...p, raceStart: e.target.value }))}
                  required className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
              <div className="col-span-2 flex justify-end">
                <button type="submit" disabled={saving}
                  className="px-6 py-2 rounded font-bold text-white text-sm"
                  style={{ backgroundColor: '#e10600' }}>
                  {saving ? 'Salvataggio...' : 'Salva GP'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Caricamento...</p>
        ) : (
          <div className="space-y-2">
            {gps.map((gp) => (
              <div key={gp.id} className="flex items-center gap-4 p-4 rounded-lg flex-wrap"
                style={{ backgroundColor: '#1e1e2e', border: '1px solid #2a2a3e' }}>
                <span className="text-xs text-gray-500 font-mono w-6">{gp.round}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-white text-sm">{gp.name}</span>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Qualifiche: {new Date(gp.qualifyingStart).toLocaleString('it-IT')}
                  </div>
                </div>
                {gp.isResultEntered ? (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1a3a1a', color: '#4ade80' }}>Risultati inseriti</span>
                ) : (
                  <Link to={`/admin/gp/${gp.id}/results`}
                    className="text-xs px-3 py-1.5 rounded no-underline font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#2a2a3e', border: '1px solid #3a3a5e' }}>
                    Inserisci risultati
                  </Link>
                )}
                <Link to={`/admin/gp/${gp.id}/predictions`}
                  className="text-xs px-3 py-1.5 rounded no-underline font-semibold transition-colors"
                  style={{ backgroundColor: '#1a1a2e', border: '1px solid #3a3a5e', color: '#a5b4fc' }}>
                  Previsioni utenti
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
