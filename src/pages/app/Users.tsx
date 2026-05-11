import { Icons } from '../../components/Icons';
import { MOCK_USERS } from '../../data/mockData';
import { ROLE_PILL, ROLE_LABELS } from '../../data/constants';
import { initials } from '../../utils/heat';
import type { UserRole } from '../../types';

const ROLE_INFO = [
  { role: 'admin'  as UserRole, title: 'Admin',  desc: 'Acceso completo: crear/eliminar agentes, gestionar usuarios y configuración global.' },
  { role: 'tester' as UserRole, title: 'Tester', desc: 'Crear y ejecutar pruebas; editar sets y casos. No puede gestionar usuarios.' },
  { role: 'viewer' as UserRole, title: 'Viewer', desc: 'Solo lectura. Puede ver resultados y métricas pero no crear ni ejecutar pruebas.' },
];

export default function Users() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-sub">Equipo con acceso a la plataforma. Los roles controlan permisos sobre agentes, sets y métricas.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary"><Icons.Plus size={14} /> Invitar</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        {ROLE_INFO.map(r => {
          const count = MOCK_USERS.filter(u => u.role === r.role).length;
          return (
            <div key={r.role} className="card">
              <div className="card-body">
                <div className="row" style={{ gap: 8 }}>
                  <span className={ROLE_PILL[r.role]}>{r.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 500, fontFamily: 'Geist Mono, monospace' }}>{count}</span>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>{r.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th><th>Email</th><th>Rol</th><th>ID</th><th>Creado</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="row" style={{ gap: 10 }}>
                    <div className="user-avatar">{initials(u.name)}</div>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                  </div>
                </td>
                <td className="muted mono" style={{ fontSize: 12.5 }}>{u.email}</td>
                <td><span className={ROLE_PILL[u.role as UserRole]}>{ROLE_LABELS[u.role as UserRole]}</span></td>
                <td><code style={{ fontSize: 11 }}>{u.id}</code></td>
                <td className="muted">
                  {new Date(u.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td><button className="icon-btn"><Icons.More size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
