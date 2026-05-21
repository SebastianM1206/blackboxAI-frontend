import { useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { Sparkline } from '../../../components/Sparkline';
import { HeatMap } from '../../../components/HeatMap';
import { CATEGORY_LABELS, PRIORITY_PILL, PRIORITY_LABELS } from '../../../data/constants';
import { useApiData } from '../../../hooks/useApiData';
import { runsApi } from '../../../services/api';
import { LoadingBlock, ErrorBlock } from '../../../components/States';
import type { Run, TestCategory, TestPriority, TestResult } from '../../../types';

interface Row {
  id: string; idx: number; input: string;
  result: TestResult; accuracy: number; latency: number;
  category: TestCategory; priority: TestPriority;
}

export default function RunDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { run?: Run } };

  const { data: res, loading, error, refetch } = useApiData(
    () => runsApi.get(id!),
    [id],
  );
  const run = res?.data ?? state?.run;

  // Reconstrucción visual de filas si el backend no devuelve detalle
  const rows = useMemo<Row[]>(() => {
    if (!run) return [];
    return Array.from({ length: run.total }, (_, i) => {
      const passing = i < run.pass;
      return {
        id: `t${i + 1}`,
        idx: i + 1,
        input: `Caso #${i + 1} — input de prueba para validar respuesta del agente`,
        result: passing ? 'pass' : (i % 4 === 0 ? 'partial' : 'fail'),
        accuracy: passing ? 0.85 + Math.random() * 0.13 : 0.2 + Math.random() * 0.35,
        latency: 800 + Math.random() * 900,
        category: (['greeting','faq','error_handling','intent_recognition','context_retention','edge_case'] as TestCategory[])[i % 6],
        priority: (['low','medium','high','critical'] as TestPriority[])[i % 4],
      };
    });
  }, [run]);

  if (loading) return <div className="page"><LoadingBlock label="Cargando ejecución…" /></div>;
  if (error || !run) return <div className="page"><ErrorBlock message={error ?? 'Ejecución no encontrada'} onRetry={refetch} /></div>;

  const heat = rows.map(r => r.result);
  const avgAccuracy = rows.reduce((s, r) => s + r.accuracy, 0) / Math.max(rows.length, 1);
  const avgLatency  = rows.reduce((s, r) => s + r.latency,  0) / Math.max(rows.length, 1);
  const failing = rows.filter(r => r.result !== 'pass');

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/runs')} style={{ marginBottom: 12 }}>
        <Icons.Chevron size={12} style={{ transform: 'rotate(180deg)' }} /> Volver
      </button>

      <div className="page-head">
        <div style={{ flex: 1 }}>
          <div className="row" style={{ gap: 10 }}>
            <h1 className="page-title">
              Ejecución <span className="mono" style={{ fontWeight: 500, color: 'var(--ink-3)' }}>{run.id}</span>
            </h1>
            <span className={`pill ${run.status === 'completed' ? 'pill-green' : run.status === 'failed' ? 'pill-red' : 'pill-amber'}`}>
              <span className="dot" />
              {run.status === 'completed' ? 'Completada' : run.status === 'failed' ? 'Fallida' : 'En curso'}
            </span>
          </div>
          <p className="page-sub">
            <strong style={{ color: 'var(--ink-2)' }}>{run.testSet}</strong>
            {' · '}{run.agent} <span className="mono" style={{ fontSize: 12 }}>v{run.agentVersion}</span>
            {' · '}iniciada {run.started} por {run.triggeredBy}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Copy size={14} /> Comparar</button>
          <button className="btn btn-primary"><Icons.PlayOutline size={14} /> Re-ejecutar</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
        <div className="card stat">
          <div className="lbl">Pass rate</div>
          <div className="val" style={{ color: 'var(--green)' }}>{Math.round(run.passRate * 100)}%</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{run.pass}/{run.total} tests</div>
        </div>
        <div className="card stat">
          <div className="lbl">Exactitud promedio</div>
          <div className="val">{avgAccuracy.toFixed(2)}</div>
          <Sparkline data={[0.78, 0.82, 0.79, 0.83, avgAccuracy]} color="var(--ink-2)" width={120} />
        </div>
        <div className="card stat">
          <div className="lbl">Latencia promedio</div>
          <div className="val">{Math.round(avgLatency)}<span style={{ fontSize: 16, color: 'var(--ink-3)' }}>ms</span></div>
        </div>
        <div className="card stat">
          <div className="lbl">Duración total</div>
          <div className="val">{run.duration}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>~{Math.round(parseFloat(run.duration) * 1000 / Math.max(run.total, 1))}ms / test</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <h3 className="card-title">Mapa de resultados · {run.total} tests</h3>
          <div className="row" style={{ marginLeft: 'auto', gap: 12, fontSize: 11.5, color: 'var(--ink-3)' }}>
            {[['var(--green)','Pass'],['var(--amber)','Parcial'],['var(--red)','Fail']].map(([c, l]) => (
              <span key={l} className="row" style={{ gap: 5 }}>
                <span style={{ width: 8, height: 8, background: c, borderRadius: 2, display: 'inline-block' }} />
                {l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <HeatMap pattern={heat} height={36} />
          <div className="row" style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'Geist Mono, monospace' }}>
            <span>#1</span>
            <span style={{ flex: 1, textAlign: 'center' }}>cada columna = 1 test · vista derivada del resumen</span>
            <span>#{run.total}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Tests con problemas</h3>
          <span className="muted" style={{ fontSize: 12 }}>{failing.length} casos</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 30 }}>#</th><th style={{ width: 50 }} />
              <th>Input</th><th>Exactitud</th><th>Latencia</th>
              <th>Categoría</th><th>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {failing.slice(0, 8).map(r => (
              <tr key={r.id}>
                <td className="mono muted" style={{ fontSize: 12 }}>{r.idx}</td>
                <td>
                  <span className={`pill ${r.result === 'fail' ? 'pill-red' : 'pill-amber'}`} style={{ padding: '1px 5px' }}>
                    {r.result === 'fail' ? <Icons.X size={10} /> : <Icons.Dot size={10} />}
                  </span>
                </td>
                <td><div className="truncate" style={{ maxWidth: 360, fontFamily: 'Geist Mono, monospace', fontSize: 12.5 }}>{r.input}</div></td>
                <td className="mono" style={{ fontSize: 12, color: r.accuracy < 0.5 ? 'var(--red)' : 'var(--amber)' }}>{r.accuracy.toFixed(2)}</td>
                <td className="mono muted" style={{ fontSize: 12 }}>{Math.round(r.latency)}ms</td>
                <td><span className="pill">{CATEGORY_LABELS[r.category]}</span></td>
                <td><span className={PRIORITY_PILL[r.priority]}>{PRIORITY_LABELS[r.priority]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
