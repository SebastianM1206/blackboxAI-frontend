import { Icons } from '../../components/Icons';
import { Sparkline } from '../../components/Sparkline';
import { MOCK_METRICS } from '../../data/mockData';
import { METRIC_TYPE_PILL } from '../../data/constants';
import type { MetricType } from '../../types';

export default function Metrics() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Librería de Métricas</h1>
          <p className="page-sub">Métricas reutilizables para evaluar la calidad de las respuestas de tus agentes.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Sparkles size={14} /> Plantilla</button>
          <button className="btn btn-primary"><Icons.Plus size={14} /> Nueva métrica</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {MOCK_METRICS.map(m => {
          const display = m.unit === 'ms' ? `${m.value}`
            : m.unit === 'percentage' ? `${(m.value * 100).toFixed(1)}`
            : m.value.toFixed(2);

          const sparkData = [0.6, 0.7, 0.65, 0.72, 0.8, 0.78, m.value > 1 ? 0.85 : m.value];

          return (
            <div key={m.id} className="card" style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <div className="row" style={{ gap: 8 }}>
                  <span className={`pill ${METRIC_TYPE_PILL[m.type as MetricType]}`}>{m.type}</span>
                  <span className="muted mono" style={{ fontSize: 11, marginLeft: 'auto' }}>usada en {m.usage} sets</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10, letterSpacing: '-0.01em' }}>{m.name}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4, minHeight: 38 }}>{m.description}</div>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div className="row">
                  <div>
                    <div className="muted" style={{ fontSize: 11 }}>valor actual</div>
                    <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 18, fontWeight: 500, marginTop: 2 }}>
                      {display}
                      <span className="muted" style={{ fontSize: 12, marginLeft: 4 }}>{m.unit}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Sparkline data={sparkData} color="var(--ink-3)" width={90} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
