import { useState } from 'react';
import { Icons } from '../../components/Icons';
import { ROLE_PILL, ROLE_LABELS } from '../../data/constants';
import { initials } from '../../utils/heat';
import { useApiData } from '../../hooks/useApiData';
import { usersApi } from '../../services/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../../components/States';
import { UserEditor } from '../../components/UserEditor';
import { useApp } from './AppLayout';
import type { User, UserRole } from '../../types';

const ROLE_INFO = [
  { role: 'admin'  as UserRole, title: 'Admin',  desc: 'Acceso completo: crear/eliminar agentes, gestionar usuarios y configuración global.' },
  { role: 'tester' as UserRole, title: 'Tester', desc: 'Crear y ejecutar pruebas; editar sets y casos. No puede gestionar usuarios.' },
  { role: 'viewer' as UserRole, title: 'Viewer', desc: 'Solo lectura. Puede ver resultados y métricas pero no crear ni ejecutar pruebas.' },
];

export default function Users() {
  const { showToast } = useApp();
  const [editor, setEditor] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const { data, loading, error, refetch } = useApiData(
    () => usersApi.list({ limit: 100 }),
    [],
  );

  const users = data?.data ?? [];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-sub">Equipo con acceso a la plataforma. Los roles controlan permisos sobre agentes, sets y métricas.</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary" onClick={() => setEditor({ open: true, user: null })}>
            <Icons.Plus size={14} /> Invitar
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        {ROLE_INFO.map(r => {
          const count = users.filter(u => u.role === r.role).length;
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

      {loading && <LoadingBlock label="Cargando usuarios…" />}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && users.length === 0 && (
        <EmptyBlock title="No hay usuarios registrados" hint="Cuando alguien se registre desde Firebase, aparecerá acá." />
      )}

      {!loading && !error && users.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th><th>Email</th><th>Rol</th><th>ID</th><th>Creado</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <div className="user-avatar">{initials(u.name || u.email)}</div>
                      <div style={{ fontWeight: 500 }}>{u.name || '(sin nombre)'}</div>
                    </div>
                  </td>
                  <td className="muted mono" style={{ fontSize: 12.5 }}>{u.email}</td>
                  <td><span className={ROLE_PILL[u.role as UserRole]}>{ROLE_LABELS[u.role as UserRole]}</span></td>
                  <td><code style={{ fontSize: 11 }}>{u.id}</code></td>
                  <td className="muted">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td>
                    <button
                      className="icon-btn"
                      onClick={e => {
                        e.stopPropagation();
                        setEditor({ open: true, user: u });
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

      {editor.open && (
        <UserEditor
          user={editor.user}
          onClose={() => setEditor({ open: false, user: null })}
          onSaved={() => {
            showToast(editor.user ? 'Usuario actualizado' : 'Usuario creado');
            setEditor({ open: false, user: null });
            refetch();
          }}
          onDeleted={() => {
            showToast('Usuario eliminado');
            setEditor({ open: false, user: null });
            refetch();
          }}
        />
      )}
    </div>
  );
}
