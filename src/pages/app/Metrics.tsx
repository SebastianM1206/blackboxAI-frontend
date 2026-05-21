import { useState } from 'react';
import { Icons } from '../../components/Icons';
import { Sparkline } from '../../components/Sparkline';
import { METRIC_TYPE_PILL } from '../../data/constants';
<<<<<<< HEAD
import { useApiData } from '../../hooks/useApiData';
import { metricsApi } from '../../services/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../../components/States';
import { MetricEditor } from '../../components/MetricEditor';
import { useApp } from './AppLayout';
import type { Metric, MetricType } from '../../types';

export default function Metrics() {
  const { showToast } = useApp();
  const [editor, setEditor] = useState<{ open: boolean; metric: Metric | null }>({ open: false, metric: null });
  const { data, loading, error, refetch } = useApiData(
    () => metricsApi.list({ limit: 100 }),
    [],
  );

  const metrics = data?.data ?? [];
=======
import { metricsApi } from '../../services/api';
import type { Metric, MetricType } from '../../types';

export default function Metrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  async function loadMetrics() {
    try {
      setLoading(true);
      setError(null);

      const response = await metricsApi.list({
        page: 1,
        limit: 100,
      });

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setMetrics(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar las métricas'
      );
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  async function handleNewMetric() {
    try {
      const timestamp = Date.now();

      await metricsApi.create({
        name: `Métrica ${timestamp}`,
        description: 'Métrica creada desde el frontend',
        type: 'score' as MetricType,
        value: 0.95,
        unit: 'percentage',
      });

      await loadMetrics();
      alert('Métrica creada correctamente');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la métrica'
      );
    }
  }

  // Carga inicial sin useEffect
  if (!initialized && !loading) {
    void loadMetrics();
  }

  if (loading && !initialized) {
    return (
      <div className="page">
        <p>Cargando métricas...</p>
      </div>
    );
  }

  if (error && !initialized) {
    return (
      <div className="page">
        <p>Error: {error}</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            void loadMetrics();
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Librería de Métricas</h1>
          <p className="page-sub">
            Métricas reutilizables para evaluar la calidad de las respuestas de tus agentes.
          </p>
        </div>

        <div className="page-actions">
<<<<<<< HEAD
          <button className="btn"><Icons.Sparkles size={14} /> Plantilla</button>
          <button className="btn btn-primary" onClick={() => setEditor({ open: true, metric: null })}>
=======
          <button className="btn">
            <Icons.Sparkles size={14} /> Plantilla
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              void handleNewMetric();
            }}
          >
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
            <Icons.Plus size={14} /> Nueva métrica
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {loading && <LoadingBlock label="Cargando métricas…" />}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && metrics.length === 0 && (
        <EmptyBlock title="No hay métricas configuradas" hint="Crea tu primera métrica para empezar a evaluar tus agentes." />
      )}

      {!loading && !error && metrics.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {metrics.map(m => {
            const display = m.unit === 'ms' ? `${m.value}`
              : m.unit === 'percentage' ? `${(m.value * 100).toFixed(1)}`
              : m.value.toFixed(2);

            const sparkData = [0.6, 0.7, 0.65, 0.72, 0.8, 0.78, m.value > 1 ? 0.85 : m.value];
=======
      {metrics.length === 0 ? (
        <div className="card">
          <div className="card-body">
            No hay métricas registradas.
          </div>
        </div>
      ) : (
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
        >
          {metrics.map((m) => {
            const value =
              typeof m.value === 'number' ? m.value : 0;

            const display =
              m.unit === 'ms'
                ? `${value}`
                : m.unit === 'percentage'
                ? `${(value * 100).toFixed(1)}`
                : value.toFixed(2);

            const sparkData = [
              0.6,
              0.7,
              0.65,
              0.72,
              0.8,
              0.78,
              value > 1 ? 0.85 : value,
            ];
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32

            return (
              <div
                key={m.id}
                className="card"
                style={{ cursor: 'pointer' }}
<<<<<<< HEAD
                onClick={() => setEditor({ open: true, metric: m })}
              >
                <div className="card-body">
                  <div className="row" style={{ gap: 8 }}>
                    <span className={`pill ${METRIC_TYPE_PILL[m.type as MetricType]}`}>{m.type}</span>
                    {m.usage !== undefined && (
                      <span className="muted mono" style={{ fontSize: 11, marginLeft: 'auto' }}>
                        usada en {m.usage} sets
                      </span>
                    )}
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
=======
              >
                <div className="card-body">
                  <div className="row" style={{ gap: 8 }}>
                    <span
                      className={`pill ${
                        METRIC_TYPE_PILL[
                          m.type as MetricType
                        ]
                      }`}
                    >
                      {m.type}
                    </span>

                    <span
                      className="muted mono"
                      style={{
                        fontSize: 11,
                        marginLeft: 'auto',
                      }}
                    >
                      usada en {m.usage ?? 0} sets
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      marginTop: 10,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {m.name}
                  </div>

                  <div
                    className="muted"
                    style={{
                      fontSize: 12.5,
                      marginTop: 4,
                      minHeight: 38,
                    }}
                  >
                    {m.description}
                  </div>

                  <div
                    className="divider"
                    style={{ margin: '12px 0' }}
                  />

                  <div className="row">
                    <div>
                      <div
                        className="muted"
                        style={{ fontSize: 11 }}
                      >
                        valor actual
                      </div>

                      <div
                        style={{
                          fontFamily:
                            'Geist Mono, monospace',
                          fontSize: 18,
                          fontWeight: 500,
                          marginTop: 2,
                        }}
                      >
                        {display}
                        <span
                          className="muted"
                          style={{
                            fontSize: 12,
                            marginLeft: 4,
                          }}
                        >
                          {m.unit}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                      <Sparkline
                        data={sparkData}
                        color="var(--ink-3)"
                        width={90}
                      />
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
<<<<<<< HEAD

      {editor.open && (
        <MetricEditor
          metric={editor.metric}
          onClose={() => setEditor({ open: false, metric: null })}
          onSaved={() => {
            showToast(editor.metric ? 'Metrica actualizada' : 'Metrica creada');
            setEditor({ open: false, metric: null });
            refetch();
          }}
          onDeleted={() => {
            showToast('Metrica eliminada');
            setEditor({ open: false, metric: null });
            refetch();
          }}
        />
      )}
=======
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
    </div>
  );
}