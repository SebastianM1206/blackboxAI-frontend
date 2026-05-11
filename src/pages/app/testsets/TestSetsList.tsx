import { useNavigate } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { Pct } from '../../../components/Pct';
import { HeatMap } from '../../../components/HeatMap';
import { MOCK_TEST_SETS } from '../../../data/mockData';

export default function TestSetsList() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Sets de Prueba</h1>
          <p className="page-sub">Conjuntos de casos de prueba agrupados por agente o por escenario.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary"><Icons.Plus size={14} /> Nuevo set</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Set</th><th>Agente</th><th>Tests</th><th>Distribución</th>
              <th>Pass rate</th><th>Última ejec.</th><th>Creador</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {MOCK_TEST_SETS.map(s => (
              <tr key={s.id} onClick={() => navigate(`/app/test-sets/${s.id}`, { state: { testSet: s } })}>
                <td>
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{s.description}</div>
                </td>
                <td>{s.agentName}</td>
                <td className="mono" style={{ fontSize: 12 }}>{s.testCount}</td>
                <td style={{ width: 180 }}>
                  <HeatMap
                    total={Math.min(s.testCount ?? 24, 24)}
                    passRate={s.passRate ?? 0.8}
                    fails={Math.round(Math.min(s.testCount ?? 24, 24) * (1 - (s.passRate ?? 0.8)))}
                    height={14}
                  />
                </td>
                <td><Pct value={s.passRate ?? 0} /></td>
                <td className="muted">{s.lastRun}</td>
                <td>{s.createdBy}</td>
                <td><button className="icon-btn" onClick={e => e.stopPropagation()}><Icons.More size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
