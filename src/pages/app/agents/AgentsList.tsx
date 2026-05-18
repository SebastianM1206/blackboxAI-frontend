import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { ProviderBadge } from '../../../components/ProviderBadge';
import { Pct } from '../../../components/Pct';
import { STATUS_PILL, STATUS_LABELS } from '../../../data/constants';
import { agentsApi } from '../../../services/api';
import type { Agent, AgentStatus } from '../../../types';

const FILTERS: [string, string][] = [
  ['all', 'Todos'],
  ['active', 'Activos'],
  ['inactive', 'Inactivos'],
  ['deprecated', 'Deprecados'],
];

export default function AgentsList() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<string>('all');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  async function loadAgents() {
    try {
      setLoading(true);
      setError(null);

      const response = await agentsApi.list({
        page: 1,
        limit: 100,
      });

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setAgents(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar agentes'
      );
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  async function handleNewAgent() {
    try {
      const timestamp = Date.now();

      await agentsApi.create({
        name: `Agente ${timestamp}`,
        description: 'Agente creado desde el frontend',
        provider: 'OpenAI',
        model: 'gpt-4',
        version: '1.0',
        status: 'active',
      });

      await loadAgents();
      alert('Agente creado correctamente');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el agente'
      );
    }
  }

  // Carga inicial sin useEffect
  if (!initialized && !loading) {
    void loadAgents();
  }

  const visible = agents.filter(
    (a) => filter === 'all' || a.status === filter
  );

  const count = (status: string) =>
    status === 'all'
      ? agents.length
      : agents.filter((a) => a.status === status).length;

  if (loading && !initialized) {
    return (
      <div className="page">
        <p>Cargando agentes...</p>
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
            void loadAgents();
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
          <h1 className="page-title">Agentes</h1>
          <p className="page-sub">
            Agentes conversacionales registrados para evaluación de caja negra.
          </p>
        </div>

        <div className="page-actions">
          <button className="btn">
            <Icons.Filter size={14} /> Filtros
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              void handleNewAgent();
            }}
          >
            <Icons.Plus size={14} /> Nuevo agente
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 14 }}>
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label} <span className="ct">{count(key)}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <div className="card-body">
            No hay agentes registrados.
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Agente</th>
                <th>Proveedor</th>
                <th>Modelo</th>
                <th>Versión</th>
                <th>Estado</th>
                <th>Sets</th>
                <th>Pass rate</th>
                <th>Última ejecución</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>

            <tbody>
              {visible.map((a) => (
                <tr
                  key={a.id}
                  onClick={() =>
                    navigate(`/app/agents/${a.id}`, {
                      state: { agent: a },
                    })
                  }
                >
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {a.name}
                    </div>
                    <div
                      className="muted"
                      style={{ fontSize: 12 }}
                    >
                      {a.description}
                    </div>
                  </td>

                  <td>
                    <ProviderBadge name={a.provider} />
                  </td>

                  <td>
                    <code style={{ fontSize: 12 }}>
                      {a.model}
                    </code>
                  </td>

                  <td
                    className="mono"
                    style={{ fontSize: 12 }}
                  >
                    v{a.version}
                  </td>

                  <td>
                    <span
                      className={
                        STATUS_PILL[
                          a.status as AgentStatus
                        ]
                      }
                    >
                      <span className="dot" />
                      {
                        STATUS_LABELS[
                          a.status as AgentStatus
                        ]
                      }
                    </span>
                  </td>

                  <td
                    className="mono"
                    style={{ fontSize: 12 }}
                  >
                    {a.testSets ?? 0}
                  </td>

                  <td>
                    <Pct value={a.passRate ?? 0} />
                  </td>

                  <td className="muted">
                    {a.lastRun ?? '-'}
                  </td>

                  <td>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Icons.More size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}