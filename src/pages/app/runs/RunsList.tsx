import { Icons } from '../../../components/Icons';
import { RunsTable } from '../../../components/RunsTable';
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

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Ejecuciones</h1>
          <p className="page-sub">Historial de ejecuciones de suites de pruebas en todos los agentes.</p>
        </div>
        <div className="page-actions">
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
    </div>
  );
}
