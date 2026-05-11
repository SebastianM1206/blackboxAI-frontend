import { useNavigate } from 'react-router-dom';
import type { Run } from '../types';
import { Pct } from './Pct';
import { Icons } from './Icons';

interface Props { runs: Run[] }

export function RunsTable({ runs }: Props) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th>Run</th>
            <th>Suite</th>
            <th>Agente</th>
            <th>Pass / Fail</th>
            <th>Pass rate</th>
            <th>Duración</th>
            <th>Cuándo</th>
            <th>Por</th>
            <th style={{ width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {runs.map(r => (
            <tr key={r.id} onClick={() => navigate(`/app/runs/${r.id}`, { state: { run: r } })}>
              <td className="mono" style={{ fontSize: 12 }}>{r.id}</td>
              <td><div style={{ fontWeight: 500 }}>{r.testSet}</div></td>
              <td>
                <div>{r.agent}</div>
                <div className="muted mono" style={{ fontSize: 11 }}>v{r.agentVersion}</div>
              </td>
              <td>
                <span className="mono" style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--green)' }}>{r.pass}</span>
                  {' / '}
                  <span style={{ color: 'var(--red)' }}>{r.fail}</span>
                </span>
              </td>
              <td><Pct value={r.passRate} /></td>
              <td className="mono muted" style={{ fontSize: 12 }}>{r.duration}</td>
              <td className="muted">{r.started}</td>
              <td className="muted">{r.triggeredBy}</td>
              <td><button className="icon-btn" onClick={e => e.stopPropagation()}><Icons.More size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
