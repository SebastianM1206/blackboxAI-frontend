import { useState, useEffect } from 'react';
import type { Agent, TestSet } from '../types';
import { Icons } from './Icons';
import { testSetsApi, agentsApi } from '../services/api';

interface Props {
  testSet: TestSet | null;
  defaultAgentId?: string;
  onClose: () => void;
  onSaved?: (set: TestSet) => void;
  onDeleted?: (id: string) => void;
}

export function TestSetEditor({ testSet, defaultAgentId, onClose, onSaved, onDeleted }: Props) {
  const [name, setName]               = useState(testSet?.name ?? '');
  const [description, setDescription] = useState(testSet?.description ?? '');
  const [agentId, setAgentId]         = useState(testSet?.agentId ?? defaultAgentId ?? '');
  const [agents, setAgents]           = useState<Agent[]>([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    agentsApi.list({ limit: 200 })
      .then(r => setAgents(r.data))
      .catch(() => setAgents([]));
  }, []);

  useEffect(() => {
    if (!agentId && agents.length > 0) setAgentId(agents[0].id);
  }, [agentId, agents]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const payload: Partial<TestSet> = { name, description, agentId };
      if (testSet) {
        const r = await testSetsApi.update(testSet.id, payload);
        onSaved?.(r.data);
      } else {
        const r = await testSetsApi.create(payload);
        onSaved?.(r.data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!testSet) return;
    if (!confirm(`¿Eliminar el set "${testSet.name}"? Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    setError(null);
    try {
      await testSetsApi.delete(testSet.id);
      onDeleted?.(testSet.id);
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
            <div style={{ fontSize: 16, fontWeight: 600 }}>{testSet ? 'Editar set' : 'Nuevo set de prueba'}</div>
            {testSet && <div className="mono-id">{testSet.id}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icons.X size={16} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <div className="stack" style={{ gap: 16 }}>
            <div className="field">
              <label>Nombre</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Suite de Saludo" />
            </div>
            <div className="field">
              <label>Descripción</label>
              <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label>Agente</label>
              <select className="select" value={agentId} onChange={e => setAgentId(e.target.value)}>
                <option value="">— Selecciona un agente —</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} · v{a.version}</option>
                ))}
              </select>
              <span className="hint">Suite a la que pertenece este conjunto de pruebas.</span>
            </div>

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
          {testSet && (
            <button className="btn btn-ghost" disabled={saving} onClick={handleDelete} style={{ color: 'var(--red)' }}>
              <Icons.Trash size={14} /> Eliminar
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn" disabled={saving} onClick={onClose}>Cancelar</button>
          <button className="btn btn-accent" disabled={saving} onClick={handleSave}>
            <Icons.Check size={14} /> {saving ? 'Guardando…' : testSet ? 'Guardar' : 'Crear set'}
          </button>
        </div>
      </div>
    </>
  );
}
