import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { Pct } from '../../../components/Pct';
import { HeatMap } from '../../../components/HeatMap';
import { testSetsApi } from '../../../services/api';
import type { TestSet } from '../../../types';

export default function TestSetsList() {
  const navigate = useNavigate();

  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  async function loadTestSets() {
    try {
      setLoading(true);
      setError(null);

      const response = await testSetsApi.list({
        page: 1,
        limit: 100,
      });

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setTestSets(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar los sets de prueba'
      );
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  async function handleNewSet() {
    try {
      const timestamp = Date.now();

      await testSetsApi.create({
        name: `Set ${timestamp}`,
        description: 'Set de prueba creado desde el frontend',
      });

      await loadTestSets();
      alert('Set de prueba creado correctamente');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el set de prueba'
      );
    }
  }

  // Carga inicial sin useEffect
  if (!initialized && !loading) {
    void loadTestSets();
  }

  if (loading && !initialized) {
    return (
      <div className="page">
        <p>Cargando sets de prueba...</p>
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
            void loadTestSets();
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
          <h1 className="page-title">Sets de Prueba</h1>
          <p className="page-sub">
            Conjuntos de casos de prueba agrupados por agente o por escenario.
          </p>
        </div>

        <div className="page-actions">
          <button className="btn">
            <Icons.Filter size={14} /> Filtros
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              void handleNewSet();
            }}
          >
            <Icons.Plus size={14} /> Nuevo set
          </button>
        </div>
      </div>

      {testSets.length === 0 ? (
        <div className="card">
          <div className="card-body">
            No hay sets de prueba registrados.
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Agente</th>
                <th>Tests</th>
                <th>Distribución</th>
                <th>Pass rate</th>
                <th>Última ejec.</th>
                <th>Creador</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>

            <tbody>
              {testSets.map((s) => (
                <tr
                  key={s.id}
                  onClick={() =>
                    navigate(`/app/test-sets/${s.id}`, {
                      state: { testSet: s },
                    })
                  }
                >
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {s.name}
                    </div>
                    <div
                      className="muted"
                      style={{ fontSize: 12 }}
                    >
                      {s.description}
                    </div>
                  </td>

                  <td>{s.agentName ?? '-'}</td>

                  <td
                    className="mono"
                    style={{ fontSize: 12 }}
                  >
                    {s.testCount ?? 0}
                  </td>

                  <td style={{ width: 180 }}>
                    <HeatMap
                      total={Math.min(s.testCount ?? 24, 24)}
                      passRate={s.passRate ?? 0.8}
                      fails={Math.round(
                        Math.min(s.testCount ?? 24, 24) *
                          (1 - (s.passRate ?? 0.8))
                      )}
                      height={14}
                    />
                  </td>

                  <td>
                    <Pct value={s.passRate ?? 0} />
                  </td>

                  <td className="muted">
                    {s.lastRun ?? '-'}
                  </td>

                  <td>{s.createdBy ?? '-'}</td>

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