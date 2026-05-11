import { useNavigate } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import { Sparkline } from '../../components/Sparkline';
import { Pct } from '../../components/Pct';
import { HealthDots } from '../../components/HeatMap';
import { ProviderBadge } from '../../components/ProviderBadge';
import { MOCK_AGENTS, MOCK_METRICS, MOCK_RUNS } from '../../data/mockData';

const STATS = [
  { lbl: 'Agentes activos', val: '4',    delta: '+1',     up: true,  spark: [3,3,3,4,4,4,4] },
  { lbl: 'Pass rate · 7d',  val: '84.2%',delta: '+2.1pp', up: true,  spark: [78,80,79,82,83,81,84] },
  { lbl: 'Ejecuciones · 7d',val: '248',  delta: '+34',    up: true,  spark: [22,28,30,38,42,40,48] },
  { lbl: 'Tests fallidos',   val: '32',   delta: '-8',     up: true,  spark: [50,46,44,40,38,36,32] },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const activeAgents = MOCK_AGENTS.filter(a => a.status === 'active');

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Resumen</h1>
          <p className="page-sub">Visión general del estado de tus agentes conversacionales y las últimas ejecuciones de pruebas.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary"><Icons.Plus size={14} /> Ejecutar suite</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {STATS.map((s, i) => (
          <div key={i} className="card stat">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="lbl">{s.lbl}</div>
                <div className="val">{s.val}</div>
                <div className={`delta ${s.up ? 'up' : 'dn'}`}>{s.delta} vs sem. anterior</div>
              </div>
              <Sparkline data={s.spark} color={s.up ? 'var(--green)' : 'var(--red)'} />
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
            <span className="muted" style={{ fontSize: 12 }}>últimas 20 ejecuciones</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/app/agents')}>
              Ver todos <Icons.Chevron size={12} />
            </button>
          </div>
          <div>
            {activeAgents.map(a => (
              <div key={a.id} className="row" style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontWeight: 500, fontSize: 13.5 }}>{a.name}</span>
                    <span className="pill"><span className="mono">v{a.version}</span></span>
                  </div>
                  <div className="row" style={{ marginTop: 4, gap: 10, fontSize: 12, color: 'var(--ink-3)' }}>
                    <ProviderBadge name={a.provider} />
                    <span className="mono">{a.model}</span>
                    <span>·</span>
                    <span>{a.testSets} sets · {a.lastRun}</span>
                  </div>
                </div>
                <HealthDots passRate={a.passRate ?? 0.8} />
                <Pct value={a.passRate ?? 0.8} />
              </div>
            ))}
          </div>
        </div>

        {/* Métricas globales */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Métricas globales</h3>
            <span className="muted" style={{ fontSize: 12 }}>promedio 7d</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/app/metrics')}>
              Configurar <Icons.Chevron size={12} />
            </button>
          </div>
          <div style={{ padding: '8px 16px 16px' }}>
            {MOCK_METRICS.slice(0, 5).map((m, i) => {
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
            {MOCK_RUNS.slice(0, 5).map(r => (
              <tr key={r.id} onClick={() => navigate(`/app/runs/${r.id}`, { state: { run: r } })}>
                <td><span className="pill pill-green" style={{ padding: '1px 5px' }}><Icons.Check size={10} /></span></td>
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
      </div>
    </div>
  );
}
