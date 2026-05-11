import { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { Sparkline } from '../../../components/Sparkline';
import { Pct } from '../../../components/Pct';
import { HeatMap } from '../../../components/HeatMap';
import { ProviderBadge } from '../../../components/ProviderBadge';
import { RunsTable } from '../../../components/RunsTable';
import { MOCK_AGENTS, MOCK_TEST_SETS, MOCK_RUNS } from '../../../data/mockData';
import { STATUS_PILL, STATUS_LABELS } from '../../../data/constants';
import type { Agent, AgentStatus } from '../../../types';

export default function AgentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { agent?: Agent } };

  const agent = state?.agent ?? MOCK_AGENTS.find(a => a.id === id) ?? MOCK_AGENTS[0];
  const [tab, setTab] = useState<'overview' | 'sets' | 'runs' | 'config'>('overview');

  const relatedSets = MOCK_TEST_SETS.filter(s => s.agentId === agent.id);
  const agentRuns = MOCK_RUNS.filter(r => r.agent === agent.name);

  const trend = useMemo(() => {
    const base = (agent.passRate ?? 0.8) * 100;
    return Array.from({ length: 8 }, () => base + (Math.random() - 0.5) * 8);
  }, [agent.passRate]);

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
          <button className="btn"><Icons.Edit size={14} /> Editar</button>
          <button className="btn btn-primary"><Icons.PlayOutline size={14} /> Ejecutar suites</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
        <div className="card stat">
          <div className="lbl">Pass rate global</div>
          <div className="val">{Math.round((agent.passRate ?? 0) * 100)}%</div>
          <Sparkline data={trend} color="var(--green)" width={150} />
        </div>
        <div className="card stat">
          <div className="lbl">Sets vinculados</div>
          <div className="val">{relatedSets.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{relatedSets.reduce((s, r) => s + (r.testCount ?? 0), 0)} tests totales</div>
        </div>
        <div className="card stat">
          <div className="lbl">Latencia P95</div>
          <div className="val">1.24<span style={{ fontSize: 16, color: 'var(--ink-3)' }}>s</span></div>
          <div className="delta dn">+120ms vs ayer</div>
        </div>
        <div className="card stat">
          <div className="lbl">Costo · 7d</div>
          <div className="val">$8.42</div>
          <div className="muted" style={{ fontSize: 11.5 }}>0.034 tk/test · 248 ejec.</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 14 }}>
        {([['overview','Resumen'], ['sets','Sets de prueba', relatedSets.length], ['runs','Ejecuciones', agentRuns.length], ['config','Configuración']] as [string,string,number?][]).map(([k, l, c]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k as typeof tab)}>
            {l}{c !== undefined && <span className="ct">{c}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">Pass rate por suite</h3>
              <span className="muted" style={{ fontSize: 12 }}>últimas ejecuciones</span>
            </div>
            <div style={{ padding: '8px 16px 16px' }}>
              {relatedSets.map(s => (
                <div key={s.id} style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{s.name}</span>
                    <span className="muted mono" style={{ fontSize: 11 }}>{s.testCount} tests</span>
                    <Pct value={s.passRate ?? 0} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <HeatMap
                      total={s.testCount ?? 24}
                      passRate={s.passRate ?? 0.8}
                      fails={Math.round((s.testCount ?? 24) * (1 - (s.passRate ?? 0.8)))}
                      height={14}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Historial de versiones</h3></div>
            <div>
              {[
                { v: agent.version, date: 'hace 2 sem', note: 'Mejora en clasificación de intenciones ambiguas', current: true },
                { v: '1.0.0', date: 'hace 1 mes', note: 'Lanzamiento inicial — reemplaza v0', current: false },
                { v: '0.9.1', date: 'hace 2 meses', note: 'Beta interna', current: false },
              ].map((v, i) => (
                <div key={i} style={{ padding: '12px 16px', borderTop: i === 0 ? 0 : '1px solid var(--line)' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>v{v.v}</span>
                    {v.current && <span className="pill pill-green">actual</span>}
                    <span className="muted" style={{ fontSize: 11.5, marginLeft: 'auto' }}>{v.date}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{v.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'sets' && (
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
                  <td className="mono" style={{ fontSize: 12 }}>{s.testCount}</td>
                  <td><Pct value={s.passRate ?? 0} /></td>
                  <td className="muted">{s.lastRun}</td>
                  <td>{s.createdBy}</td>
                  <td><button className="icon-btn" onClick={e => e.stopPropagation()}><Icons.More size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'runs' && <RunsTable runs={agentRuns.length > 0 ? agentRuns : MOCK_RUNS} />}

      {tab === 'config' && (
        <div className="card" style={{ maxWidth: 720 }}>
          <div className="card-body stack" style={{ gap: 16 }}>
            <div className="field">
              <label>Nombre</label>
              <input className="input" defaultValue={agent.name} />
            </div>
            <div className="field">
              <label>Descripción</label>
              <textarea className="textarea" defaultValue={agent.description} />
            </div>
            <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Proveedor</label>
                <select className="select" defaultValue={agent.provider}>
                  <option>OpenAI</option><option>Anthropic</option><option>Google</option><option>Mistral</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Modelo</label>
                <input className="input mono" defaultValue={agent.model} />
              </div>
              <div className="field" style={{ width: 120 }}>
                <label>Versión</label>
                <input className="input mono" defaultValue={agent.version} />
              </div>
            </div>
            <div className="field">
              <label>Endpoint / API key (encriptada)</label>
              <input className="input mono" defaultValue="sk-•••••••••••••••••••••rL4q" />
              <span className="hint">Guardada de forma encriptada. Solo visible al rotarla.</span>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost">Cancelar</button>
              <button className="btn btn-accent">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
