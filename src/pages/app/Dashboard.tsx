import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import { Sparkline } from '../../components/Sparkline';
import { Pct } from '../../components/Pct';
import { HealthDots } from '../../components/HeatMap';
import { ProviderBadge } from '../../components/ProviderBadge';
import { useApiData } from '../../hooks/useApiData';
import { agentsApi, metricsApi, runsApi } from '../../services/api';
import { LoadingBlock, ErrorBlock } from '../../components/States';
import { ApiError } from '../../types';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: agentsRes, loading: la, error: ea, refetch: ra } = useApiData(
    () => agentsApi.list({ limit: 100 }),
    [],
  );
  const { data: metricsRes, loading: lm, error: em, refetch: rm } = useApiData(
    () => metricsApi.list({ limit: 20 }),
    [],
  );
  const { data: runsRes } = useApiData(
    async () => {
      try {
        return await runsApi.list({ limit: 5 });
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          return { message: 'no runs', data: [], pagination: { total: 0, page: 1, limit: 5, totalPages: 0 } };
        }
        throw e;
      }
    },
    [],
  );

  const agents = agentsRes?.data ?? [];
  const metrics = metricsRes?.data ?? [];
  const runs   = runsRes?.data ?? [];

  const stats = useMemo(() => {
    const active = agents.filter(a => a.status === 'active').length;
    const totalRuns = runs.length;
    const totalFails = runs.reduce((s, r) => s + (r.fail ?? 0), 0);
    const avgPass = runs.length ? runs.reduce((s, r) => s + (r.passRate ?? 0), 0) / runs.length : null;
    return [
      { lbl: 'Agentes activos',   val: String(active),                                       spark: [active, active, active, active, active, active, active] },
      { lbl: 'Pass rate · últimos',val: avgPass !== null ? `${(avgPass * 100).toFixed(1)}%` : '—', spark: runs.map(r => r.passRate * 100).slice(-7) },
      { lbl: 'Ejecuciones · 7d',   val: String(totalRuns),                                    spark: [totalRuns] },
      { lbl: 'Tests fallidos',     val: String(totalFails),                                   spark: runs.map(r => r.fail).slice(-7) },
    ];
  }, [agents, runs]);

  const loading = la || lm;
  const error = ea ?? em;

  if (loading) return <div className="page"><LoadingBlock label="Cargando dashboard…" /></div>;
  if (error) return <div className="page"><ErrorBlock message={error} onRetry={() => { ra(); rm(); }} /></div>;

  const activeAgents = agents.filter(a => a.status === 'active');

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Resumen</h1>
          <p className="page-sub">Visión general del estado de tus agentes conversacionales y las últimas ejecuciones de pruebas.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary" onClick={() => navigate('/app/test-sets')}>
            <Icons.Plus size={14} /> Ejecutar suite
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((s, i) => (
          <div key={i} className="card stat">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="lbl">{s.lbl}</div>
                <div className="val">{s.val}</div>
              </div>
              {s.spark && s.spark.length > 1 && <Sparkline data={s.spark} color="var(--ink-3)" />}
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 18 }} />

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Agent health */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Salud de Agentes</h3>
            <span className="muted" style={{ fontSize: 12 }}>{activeAgents.length} activos</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/app/agents')}>
              Ver todos <Icons.Chevron size={12} />
            </button>
          </div>
          {activeAgents.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              No hay agentes activos. <a href="#" onClick={e => { e.preventDefault(); navigate('/app/agents'); }} style={{ color: 'var(--ink)' }}>Crear uno</a>.
            </div>
          ) : (
            <div>
              {activeAgents.map(a => (
                <div key={a.id} className="row" style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', gap: 14, cursor: 'pointer' }}
                     onClick={() => navigate(`/app/agents/${a.id}`)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{a.name}</span>
                      <span className="pill"><span className="mono">v{a.version}</span></span>
                    </div>
                    <div className="row" style={{ marginTop: 4, gap: 10, fontSize: 12, color: 'var(--ink-3)' }}>
                      <ProviderBadge name={a.provider} />
                      <span className="mono">{a.model}</span>
                      {a.testSets !== undefined && <>
                        <span>·</span>
                        <span>{a.testSets} sets {a.lastRun ? `· ${a.lastRun}` : ''}</span>
                      </>}
                    </div>
                  </div>
                  {a.passRate !== undefined && (
                    <>
                      <HealthDots passRate={a.passRate} />
                      <Pct value={a.passRate} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Métricas globales */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Métricas globales</h3>
            <span className="muted" style={{ fontSize: 12 }}>{metrics.length} métricas</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/app/metrics')}>
              Configurar <Icons.Chevron size={12} />
            </button>
          </div>
          {metrics.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              No hay métricas configuradas.
            </div>
          ) : (
            <div style={{ padding: '8px 16px 16px' }}>
              {metrics.slice(0, 5).map((m, i) => {
                const target = m.type === 'latency' ? 1500 : m.type === 'toxicity' ? 0.05 : 0.85;
                const good = m.type === 'latency' || m.type === 'toxicity' ? m.value < target : m.value > target;
                const display = m.unit === 'ms' ? `${m.value}ms`
                  : m.unit === 'percentage' ? `${(m.value * 100).toFixed(1)}%`
                  : m.value.toFixed(2);
                const pct = m.type === 'latency' ? Math.min(100, (m.value / 2500) * 100)
                  : m.type === 'toxicity' ? Math.min(100, (m.value / 0.15) * 100)
                  : m.value * 100;
                return (
                  <div key={m.id} style={{ padding: '8px 0', borderTop: i === 0 ? 0 : '1px solid var(--line)' }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                      <span className="pill" style={{ fontSize: 10.5 }}>{m.type}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: 'Geist Mono, monospace', fontSize: 13, color: good ? 'var(--green)' : 'var(--amber)' }}>{display}</span>
                    </div>
                    <div className="progress" style={{ marginTop: 6 }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, background: good ? 'var(--green)' : 'var(--amber)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 18 }} />

      {/* Recent runs */}
      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Ejecuciones recientes</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/app/runs')}>
            Ver todas <Icons.Chevron size={12} />
          </button>
        </div>
        {runs.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
            Aún no hay ejecuciones. Ejecuta un set para que aparezcan aquí.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 30 }} />
                <th>Suite</th><th>Agente</th><th>Resultados</th>
                <th>Pass rate</th><th>Duración</th><th>Cuándo</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id} onClick={() => navigate(`/app/runs/${r.id}`, { state: { run: r } })}>
                  <td>
                    <span className={`pill ${r.status === 'completed' ? 'pill-green' : r.status === 'failed' ? 'pill-red' : 'pill-amber'}`} style={{ padding: '1px 5px' }}>
                      {r.status === 'completed' ? <Icons.Check size={10} /> : r.status === 'failed' ? <Icons.X size={10} /> : <Icons.Dot size={10} />}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.testSet}</div>
                    <div className="id">{r.id}</div>
                  </td>
                  <td>
                    <div>{r.agent}</div>
                    <div className="muted mono" style={{ fontSize: 11 }}>v{r.agentVersion}</div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--green)' }}>{r.pass} pass</span>
                      {' · '}
                      <span style={{ color: 'var(--red)' }}>{r.fail} fail</span>
                    </span>
                  </td>
                  <td><Pct value={r.passRate} /></td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{r.duration}</td>
                  <td className="muted">{r.started}</td>
                  <td><button className="icon-btn" onClick={e => e.stopPropagation()}><Icons.More size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
