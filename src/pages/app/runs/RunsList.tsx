import { useState } from 'react';
import { Icons } from '../../../components/Icons';
import { RunsTable } from '../../../components/RunsTable';
import { testsApi } from '../../../services/api';
import type { Run } from '../../../types';

export default function RunsList() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  async function loadRuns() {
    try {
      setLoading(true);
      setError(null);

      const response = await testsApi.list({
        page: 1,
        limit: 100,
      });

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      // Convertimos los datos recibidos al tipo que espera RunsTable
      setRuns(data as unknown as Run[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar las ejecuciones'
      );
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  async function handleNewRun() {
    try {
      // Acción funcional real: recargar las ejecuciones desde la API
      // (más adelante podría reemplazarse por un modal para crear una ejecución)
      await loadRuns();

      alert('Ejecuciones actualizadas correctamente');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'No se pudieron actualizar las ejecuciones'
      );
    }
  }

  // Carga inicial sin useEffect
  if (!initialized && !loading) {
    void loadRuns();
  }

  if (loading && !initialized) {
    return (
      <div className="page">
        <p>Cargando ejecuciones...</p>
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
            void loadRuns();
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
          <h1 className="page-title">Ejecuciones</h1>
          <p className="page-sub">
            Historial de ejecuciones de suites de pruebas en todos los agentes.
          </p>
        </div>

        <div className="page-actions">
          <button className="btn">
            <Icons.Filter size={14} /> Filtros
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              void handleNewRun();
            }}
          >
            <Icons.PlayOutline size={14} /> Nueva ejecución
          </button>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="card">
          <div className="card-body">
            No hay ejecuciones registradas.
          </div>
        </div>
      ) : (
        <RunsTable runs={runs} />
      )}
    </div>
  );
}