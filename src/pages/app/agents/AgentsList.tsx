import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { ProviderBadge } from '../../../components/ProviderBadge';
import { Pct } from '../../../components/Pct';
import { STATUS_PILL, STATUS_LABELS } from '../../../data/constants';
import { useApiData } from '../../../hooks/useApiData';
import { agentsApi } from '../../../services/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../../../components/States';
import { AgentEditor } from '../../../components/AgentEditor';
import { useApp } from '../AppLayout';
import type { AgentStatus, Agent } from '../../../types';

const FILTERS: [string, string][] = [
  ['all', 'Todos'],
  ['active', 'Activos'],
  ['inactive', 'Inactivos'],
  ['deprecated', 'Deprecados'],
];

export default function AgentsList() {
  const navigate = useNavigate();
  const { showToast, refreshSidebar } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [editor, setEditor] = useState<{ open: boolean; agent: Agent | null }>({ open: false, agent: null });

  const { data, loading, error, refetch } = useApiData(
    () => agentsApi.list({ limit: 100 }),
    [],
  );

  const agents = data?.data ?? [];

  const visible = useMemo(
    () => agents.filter(a => filter === 'all' || a.status === filter),
    [agents, filter],
  );
  const count = (s: string) => s === 'all' ? agents.length : agents.filter(a => a.status === s).length;

  function handleSaved(saved: Agent) {
    showToast(editor.agent ? 'Agente actualizado' : 'Agente creado');
    setEditor({ open: false, agent: null });
    refetch();
    refreshSidebar();
    if (!editor.agent) navigate(`/app/agents/${saved.id}`);
  }

  function handleDeleted() {
    showToast('Agente eliminado');
    setEditor({ open: false, agent: null });
    refetch();
    refreshSidebar();
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Agentes</h1>
          <p className="page-sub">Agentes conversacionales registrados para evaluación de caja negra.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary" onClick={() => setEditor({ open: true, agent: null })}>
            <Icons.Plus size={14} /> Nuevo agente
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 14 }}>
        {FILTERS.map(([key, label]) => (
          <button key={key} className={`tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            {label} <span className="ct">{count(key)}</span>
          </button>
        ))}
      </div>

      {loading && <LoadingBlock label="Cargando agentes…" />}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && agents.length === 0 && (
        <EmptyBlock
          title="Aún no hay agentes"
          hint="Registra tu primer agente conversacional para empezar a evaluarlo."
          action={
            <button className="btn btn-primary" onClick={() => setEditor({ open: true, agent: null })}>
              <Icons.Plus size={14} /> Crear primer agente
            </button>
          }
        />
      )}

      {!loading && !error && agents.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Agente</th><th>Proveedor</th><th>Modelo</th><th>Versión</th>
                <th>Estado</th><th>Sets</th><th>Pass rate</th><th>Última ejecución</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {visible.map(a => (
                <tr key={a.id} onClick={() => navigate(`/app/agents/${a.id}`, { state: { agent: a } })}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{a.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{a.description}</div>
                  </td>
                  <td><ProviderBadge name={a.provider} /></td>
                  <td><code style={{ fontSize: 12 }}>{a.model}</code></td>
                  <td className="mono" style={{ fontSize: 12 }}>v{a.version}</td>
                  <td>
                    <span className={STATUS_PILL[a.status as AgentStatus]}>
                      <span className="dot" />{STATUS_LABELS[a.status as AgentStatus]}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{a.testSets ?? '—'}</td>
                  <td>{a.passRate !== undefined ? <Pct value={a.passRate} /> : <span className="muted">—</span>}</td>
                  <td className="muted">{a.lastRun ?? '—'}</td>
                  <td>
                    <button className="icon-btn" onClick={e => { e.stopPropagation(); setEditor({ open: true, agent: a }); }}>
                      <Icons.More size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editor.open && (
        <AgentEditor
          agent={editor.agent}
          onClose={() => setEditor({ open: false, agent: null })}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
