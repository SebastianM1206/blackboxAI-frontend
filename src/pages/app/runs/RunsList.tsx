import { useState } from 'react';
import { Icons } from '../../../components/Icons';
import { RunsTable } from '../../../components/RunsTable';
<<<<<<< HEAD
import { useApiData } from '../../../hooks/useApiData';
import { runsApi } from '../../../services/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../../../components/States';
import { ApiError } from '../../../types';

export default function RunsList() {
  const { data, loading, error, refetch } = useApiData(
    async () => {
      try {
        return await runsApi.list({ limit: 100 });
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          return { message: 'no runs endpoint', data: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 0 } };
        }
        throw e;
      }
    },
    [],
  );

  const runs = data?.data ?? [];
=======
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
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32

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
<<<<<<< HEAD
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
        </div>
      </div>

      {loading && <LoadingBlock label="Cargando ejecuciones…" />}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && runs.length === 0 && (
        <EmptyBlock
          title="No hay ejecuciones registradas"
          hint="Ejecuta un set de pruebas para que aparezca aquí. El endpoint /runs es opcional en esta versión del backend."
        />
      )}
      {!loading && !error && runs.length > 0 && <RunsTable runs={runs} />}
=======
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
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
    </div>
  );
}