import { Icons } from '../../../components/Icons';
import { RunsTable } from '../../../components/RunsTable';
import { MOCK_RUNS } from '../../../data/mockData';

export default function RunsList() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Ejecuciones</h1>
          <p className="page-sub">Historial de ejecuciones de suites de pruebas en todos los agentes.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary"><Icons.PlayOutline size={14} /> Nueva ejecución</button>
        </div>
      </div>
      <RunsTable runs={MOCK_RUNS} />
    </div>
  );
}
