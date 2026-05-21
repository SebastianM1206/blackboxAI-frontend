import { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { Sparkline } from '../../../components/Sparkline';
import { Pct } from '../../../components/Pct';
import { HeatMap } from '../../../components/HeatMap';
import { ProviderBadge } from '../../../components/ProviderBadge';
import { RunsTable } from '../../../components/RunsTable';
import { STATUS_PILL, STATUS_LABELS } from '../../../data/constants';
import { useApiData } from '../../../hooks/useApiData';
import { agentsApi, testSetsApi, runsApi } from '../../../services/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../../../components/States';
import { AgentEditor } from '../../../components/AgentEditor';
import { useApp } from '../AppLayout';
import type { Agent, AgentStatus } from '../../../types';
import { ApiError } from '../../../types';

export default function AgentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { agent?: Agent } };
  const { showToast, refreshSidebar } = useApp();
  const [tab, setTab] = useState<'overview' | 'sets' | 'runs' | 'config'>('overview');
  const [editorOpen, setEditorOpen] = useState(false);

  const { data: agentRes, loading, error, refetch } = useApiData(
    () => agentsApi.get(id!),
    [id],
  );
  const agent = agentRes?.data ?? state?.agent;

  const { data: setsRes } = useApiData(
    () => agent ? testSetsApi.list({ agentId: agent.id, limit: 100 }) : Promise.reject(new Error('agente no cargado')),
    [agent?.id],
  );

  const { data: runsRes } = useApiData(
    async () => {
      if (!agent) throw new Error('agente no cargado');
      try {
        return await runsApi.list({ agentId: agent.id, limit: 30 });
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return { message: 'no runs', data: [], pagination: { total: 0, page: 1, limit: 30, totalPages: 0 } };
        throw e;
      }
    },
    [agent?.id],
  );

  const relatedSets = setsRes?.data ?? [];
  const agentRuns   = runsRes?.data ?? [];

  const trend = useMemo(() => {
    const base = (agent?.passRate ?? 0.8) * 100;
    return Array.from({ length: 8 }, () => base + (Math.random() - 0.5) * 8);
  }, [agent?.passRate]);

  if (loading) return <div className="page"><LoadingBlock label="Cargando agente…" /></div>;
  if (error || !agent) return <div className="page"><ErrorBlock message={error ?? 'Agente no encontrado'} onRetry={refetch} /></div>;

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/agents')} style={{ marginBottom: 12 }}>
        <Icons.Chevron size={12} style={{ transform: 'rotate(180deg)' }} /> Agentes
      </button>

      <div className="page-head">
        <div style={{ flex: 1 }}>
          <div className="row" style={{ gap: 10 }}>
            <h1 className="page-title">{agent.name}</h1>
            <span className={STATUS_PILL[agent.status as AgentStatus]}>
              <span className="dot" />{STATUS_LABELS[agent.status as AgentStatus]}
            </span>
            <span className="pill"><span className="mono">v{agent.version}</span></span>
          </div>
          <p className="page-sub">{agent.description}</p>
          <div className="row" style={{ marginTop: 10, gap: 18, fontSize: 12.5, color: 'var(--ink-3)' }}>
            <span className="row"><span className="muted">ID</span><code style={{ marginLeft: 6, fontSize: 11 }}>{agent.id}</code></span>
            <span>·</span>
            <ProviderBadge name={agent.provider} />
            <span>·</span>
            <span className="mono">{agent.model}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setEditorOpen(true)}><Icons.Edit size={14} /> Editar</button>
          <button className="btn btn-primary" onClick={() => navigate('/app/test-sets', { state: { agentId: agent.id } })}>
            <Icons.PlayOutline size={14} /> Ver suites
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
        <div className="card stat">
          <div className="lbl">Pass rate global</div>
          <div className="val">{agent.passRate !== undefined ? `${Math.round(agent.passRate * 100)}%` : '—'}</div>
          {agent.passRate !== undefined && <Sparkline data={trend} color="var(--green)" width={150} />}
        </div>
        <div className="card stat">
          <div className="lbl">Sets vinculados</div>
          <div className="val">{relatedSets.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>
            {relatedSets.reduce((s, r) => s + (r.testCount ?? 0), 0)} tests totales
          </div>
        </div>
        <div className="card stat">
          <div className="lbl">Ejecuciones</div>
          <div className="val">{agentRuns.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>en los últimos registros</div>
        </div>
        <div className="card stat">
          <div className="lbl">Estado</div>
          <div className="val" style={{ fontSize: 18 }}>{STATUS_LABELS[agent.status as AgentStatus]}</div>
          {agent.createdAt && (
            <div className="muted" style={{ fontSize: 11.5 }}>
              creado {new Date(agent.createdAt).toLocaleDateString('es-CO')}
            </div>
          )}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 14 }}>
        {([
          ['overview', 'Resumen'],
          ['sets',     'Sets de prueba', relatedSets.length],
          ['runs',     'Ejecuciones',    agentRuns.length],
          ['config',   'Configuración'],
        ] as [string, string, number?][]).map(([k, l, c]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k as typeof tab)}>
            {l}{c !== undefined && <span className="ct">{c}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Pass rate por suite</h3>
            <span className="muted" style={{ fontSize: 12 }}>{relatedSets.length} sets</span>
          </div>
          {relatedSets.length === 0 ? (
            <div style={{ padding: 24 }}>
              <EmptyBlock title="Sin sets vinculados" hint="Crea un set de pruebas y vincúlalo a este agente." />
            </div>
          ) : (
            <div style={{ padding: '8px 16px 16px' }}>
              {relatedSets.map(s => (
                <div key={s.id} style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1, cursor: 'pointer' }}
                          onClick={() => navigate(`/app/test-sets/${s.id}`)}>{s.name}</span>
                    <span className="muted mono" style={{ fontSize: 11 }}>{s.testCount ?? 0} tests</span>
                    {s.passRate !== undefined && <Pct value={s.passRate} />}
                  </div>
                  {s.passRate !== undefined && s.testCount !== undefined && (
                    <div style={{ marginTop: 6 }}>
                      <HeatMap
                        total={Math.min(s.testCount, 24)}
                        passRate={s.passRate}
                        fails={Math.round(Math.min(s.testCount, 24) * (1 - s.passRate))}
                        height={14}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'sets' && (
        relatedSets.length === 0 ? (
          <EmptyBlock title="Sin sets vinculados" />
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr><th>Set</th><th>Tests</th><th>Pass rate</th><th>Última ejecución</th><th>Creador</th><th style={{ width: 40 }} /></tr>
              </thead>
              <tbody>
                {relatedSets.map(s => (
                  <tr key={s.id} onClick={() => navigate(`/app/test-sets/${s.id}`, { state: { testSet: s } })}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{s.description}</div>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{s.testCount ?? '—'}</td>
                    <td>{s.passRate !== undefined ? <Pct value={s.passRate} /> : <span className="muted">—</span>}</td>
                    <td className="muted">{s.lastRun ?? '—'}</td>
                    <td>{s.createdBy ?? '—'}</td>
                    <td><button className="icon-btn" onClick={e => e.stopPropagation()}><Icons.More size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'runs' && (agentRuns.length === 0
        ? <EmptyBlock title="Sin ejecuciones para este agente" />
        : <RunsTable runs={agentRuns} />)}

      {tab === 'config' && (
        <div className="card" style={{ maxWidth: 720 }}>
          <div className="card-body stack" style={{ gap: 16 }}>
            <div className="field">
              <label>Endpoint URL</label>
              <input className="input mono" value={agent.endpointUrl ?? ''} readOnly />
            </div>
            <div className="field">
              <label>API key</label>
              <input className="input mono" value="••••••••••••••••" readOnly />
              <span className="hint">Guardada de forma encriptada en el backend. Solo se puede rotar editando el agente.</span>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-accent" onClick={() => setEditorOpen(true)}>
                <Icons.Edit size={14} /> Editar agente
              </button>
            </div>
          </div>
        </div>
      )}

      {editorOpen && (
        <AgentEditor
          agent={agent}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            showToast('Agente actualizado');
            refetch();
            refreshSidebar();
          }}
          onDeleted={() => {
            setEditorOpen(false);
            showToast('Agente eliminado');
            refreshSidebar();
            navigate('/app/agents');
          }}
        />
      )}
    </div>
  );
}
