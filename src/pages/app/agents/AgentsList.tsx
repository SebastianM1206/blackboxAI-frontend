import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { ProviderBadge } from '../../../components/ProviderBadge';
import { Pct } from '../../../components/Pct';
import { MOCK_AGENTS } from '../../../data/mockData';
import { STATUS_PILL, STATUS_LABELS } from '../../../data/constants';
import type { AgentStatus } from '../../../types';

const FILTERS: [string, string][] = [
  ['all', 'Todos'],
  ['active', 'Activos'],
  ['inactive', 'Inactivos'],
  ['deprecated', 'Deprecados'],
];

export default function AgentsList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');

  const visible = MOCK_AGENTS.filter(a => filter === 'all' || a.status === filter);
  const count = (s: string) => s === 'all' ? MOCK_AGENTS.length : MOCK_AGENTS.filter(a => a.status === s).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Agentes</h1>
          <p className="page-sub">Agentes conversacionales registrados para evaluación de caja negra.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary"><Icons.Plus size={14} /> Nuevo agente</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 14 }}>
        {FILTERS.map(([key, label]) => (
          <button key={key} className={`tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            {label} <span className="ct">{count(key)}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Agente</th><th>Proveedor</th><th>Modelo</th><th>Versión</th>
              <th>Estado</th><th>Sets</th><th>Pass rate</th><th>Última ejecución</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {visible.map(a => (
              <tr key={a.id} onClick={() => navigate(`/app/agents/${a.id}`, { state: { agent: a } })}>
                <td>
                  <div style={{ fontWeight: 500 }}>{a.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{a.description}</div>
                </td>
                <td><ProviderBadge name={a.provider} /></td>
                <td><code style={{ fontSize: 12 }}>{a.model}</code></td>
                <td className="mono" style={{ fontSize: 12 }}>v{a.version}</td>
                <td>
                  <span className={STATUS_PILL[a.status as AgentStatus]}>
                    <span className="dot" />{STATUS_LABELS[a.status as AgentStatus]}
                  </span>
                </td>
                <td className="mono" style={{ fontSize: 12 }}>{a.testSets}</td>
                <td><Pct value={a.passRate ?? 0} /></td>
                <td className="muted">{a.lastRun}</td>
                <td><button className="icon-btn" onClick={e => e.stopPropagation()}><Icons.More size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
