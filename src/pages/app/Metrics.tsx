import { useState } from 'react';
import { Icons } from '../../components/Icons';
import { Sparkline } from '../../components/Sparkline';
import { METRIC_TYPE_PILL } from '../../data/constants';
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
          <button className="btn">
            <Icons.Sparkles size={14} /> Plantilla
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              void handleNewMetric();
            }}
          >
            <Icons.Plus size={14} /> Nueva métrica
          </button>
        </div>
      </div>

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

            return (
              <div
                key={m.id}
                className="card"
                style={{ cursor: 'pointer' }}
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}