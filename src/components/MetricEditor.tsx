import { useState, useMemo } from 'react';
import type { Metric, MetricType, MetricUnit } from '../types';
import { Icons } from './Icons';
import { metricsApi } from '../services/api';

const TYPE_LABELS: Record<MetricType, string> = {
  accuracy: 'Exactitud',
  latency: 'Latencia',
  coherence: 'Coherencia',
  relevance: 'Relevancia',
  toxicity: 'Toxicidad',
  custom: 'Personalizada',
};

const UNIT_LABELS: Record<MetricUnit, string> = {
  ratio: 'Ratio (0-1)',
  percentage: 'Porcentaje (0-1)',
  ms: 'Milisegundos',
  score: 'Score',
  count: 'Conteo',
};

const TYPES: MetricType[] = ['accuracy', 'latency', 'coherence', 'relevance', 'toxicity', 'custom'];
const UNITS: MetricUnit[] = ['ratio', 'percentage', 'ms', 'score', 'count'];

interface Props {
  metric: Metric | null;
  onClose: () => void;
  onSaved?: (metric: Metric) => void;
  onDeleted?: (id: string) => void;
}

export function MetricEditor({ metric, onClose, onSaved, onDeleted }: Props) {
  const [name, setName] = useState(metric?.name ?? '');
  const [description, setDescription] = useState(metric?.description ?? '');
  const [type, setType] = useState<MetricType>(metric?.type ?? 'accuracy');
  const [unit, setUnit] = useState<MetricUnit>(metric?.unit ?? 'ratio');
  const [value, setValue] = useState(String(metric?.value ?? 0.85));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = useMemo(() => (unit === 'ms' || unit === 'count' ? 1 : 0.01), [unit]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setSaving(false);
      setError('Valor invalido. Usa un numero.');
      return;
    }

    try {
      const payload: Partial<Metric> = {
        name: name.trim() || 'Metrica sin nombre',
        description: description.trim() || undefined,
        type,
        unit,
        value: parsed,
      };
      if (metric) {
        const r = await metricsApi.update(metric.id, payload);
        onSaved?.(r.data);
      } else {
        const r = await metricsApi.create(payload);
        onSaved?.(r.data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!metric) return;
    if (!confirm(`Eliminar la metrica "${metric.name}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      await metricsApi.delete(metric.id);
      onDeleted?.(metric.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{metric ? 'Editar metrica' : 'Nueva metrica'}</div>
            {metric && <div className="mono-id">{metric.id}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icons.X size={16} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <div className="stack" style={{ gap: 16 }}>
            <div className="field">
              <label>Nombre</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Exactitud semantica" />
            </div>
            <div className="field">
              <label>Descripcion</label>
              <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Tipo</label>
                <select
                  className="select"
                  value={type}
                  onChange={e => {
                    const next = e.target.value as MetricType;
                    setType(next);
                    if (next === 'latency') setUnit('ms');
                  }}
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Unidad</label>
                <select className="select" value={unit} onChange={e => setUnit(e.target.value as MetricUnit)}>
                  {UNITS.map(u => (
                    <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ width: 160 }}>
                <label>Valor</label>
                <input
                  className="input mono"
                  type="number"
                  value={value}
                  step={step}
                  onChange={e => setValue(e.target.value)}
                />
              </div>
            </div>
            <div className="hint">Para ratio/porcentaje usa valores entre 0 y 1.</div>

            {error && (
              <div style={{
                padding: '8px 10px', borderRadius: 6, fontSize: 12.5,
                background: 'rgba(213, 71, 71, 0.08)', color: 'var(--red)',
                border: '1px solid rgba(213, 71, 71, 0.25)',
              }}>{error}</div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {metric && (
            <button className="btn btn-ghost" disabled={saving} onClick={handleDelete} style={{ color: 'var(--red)' }}>
              <Icons.Trash size={14} /> Eliminar
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn" disabled={saving} onClick={onClose}>Cancelar</button>
          <button className="btn btn-accent" disabled={saving} onClick={handleSave}>
            <Icons.Check size={14} /> {saving ? 'Guardando…' : metric ? 'Guardar' : 'Crear metrica'}
          </button>
        </div>
      </div>
    </>
  );
}
