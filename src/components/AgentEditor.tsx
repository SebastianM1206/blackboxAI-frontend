import { useState } from 'react';
import type { Agent, AgentStatus } from '../types';
import { Icons } from './Icons';
import { agentsApi } from '../services/api';
import { isMockEnabled } from '../data/mockData';

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Cohere', 'custom'];
const STATUSES: AgentStatus[] = ['active', 'inactive', 'deprecated'];

interface Props {
  agent: Agent | null;
  onClose: () => void;
  onSaved?: (agent: Agent) => void;
  onDeleted?: (id: string) => void;
}

export function AgentEditor({ agent, onClose, onSaved, onDeleted }: Props) {
  const [name, setName]               = useState(agent?.name ?? '');
  const [description, setDescription] = useState(agent?.description ?? '');
  const [endpointUrl, setEndpointUrl] = useState(agent?.endpointUrl ?? '');
  const [apiKey, setApiKey]           = useState('');
  const [provider, setProvider]       = useState(agent?.provider ?? 'custom');
  const [model, setModel]             = useState(agent?.model ?? 'custom-model');
  const [version, setVersion]         = useState(agent?.version ?? '1.0.0');
  const [status, setStatus]           = useState<AgentStatus>(agent?.status ?? 'active');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const payload: Partial<Agent> = {
        name, description, endpointUrl, provider, model, version, status,
      };
      if (apiKey) payload.apiKey = apiKey;

      if (agent) {
        const r = await agentsApi.update(agent.id, payload);
        onSaved?.(r.data);
      } else {
        if (!apiKey && !isMockEnabled()) throw new Error('API key requerida al crear un agente.');
        const r = await agentsApi.create(payload);
        onSaved?.(r.data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!agent) return;
    if (!confirm(`¿Eliminar el agente "${agent.name}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      await agentsApi.delete(agent.id);
      onDeleted?.(agent.id);
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
            <div style={{ fontSize: 16, fontWeight: 600 }}>{agent ? 'Editar agente' : 'Nuevo agente'}</div>
            {agent && <div className="mono-id">{agent.id}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icons.X size={16} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <div className="stack" style={{ gap: 16 }}>
            <div className="field">
              <label>Nombre</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Asistente de Soporte" />
            </div>
            <div className="field">
              <label>Descripción</label>
              <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label>Endpoint URL</label>
              <input
                className="input mono"
                value={endpointUrl}
                onChange={e => setEndpointUrl(e.target.value)}
                placeholder="https://api.miagente.com/v1/chat"
              />
              <span className="hint">URL contra la que se envían los inputs durante las ejecuciones.</span>
            </div>
            <div className="field">
              <label>API key {agent && <span className="muted" style={{ fontWeight: 400 }}>(dejar en blanco para no cambiar)</span>}</label>
              <input
                className="input mono"
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={agent ? '••••••••' : 'sk-...'}
              />
            </div>
            <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Proveedor</label>
                <select className="select" value={provider} onChange={e => setProvider(e.target.value)}>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Modelo</label>
                <input className="input mono" value={model} onChange={e => setModel(e.target.value)} />
              </div>
              <div className="field" style={{ width: 120 }}>
                <label>Versión</label>
                <input className="input mono" value={version} onChange={e => setVersion(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Estado</label>
              <select className="select" value={status} onChange={e => setStatus(e.target.value as AgentStatus)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
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
          {agent && (
            <button className="btn btn-ghost" disabled={saving} onClick={handleDelete} style={{ color: 'var(--red)' }}>
              <Icons.Trash size={14} /> Eliminar
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn" disabled={saving} onClick={onClose}>Cancelar</button>
          <button className="btn btn-accent" disabled={saving} onClick={handleSave}>
            <Icons.Check size={14} /> {saving ? 'Guardando…' : agent ? 'Guardar' : 'Crear agente'}
          </button>
        </div>
      </div>
    </>
  );
}
