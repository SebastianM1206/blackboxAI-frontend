import { useState } from 'react';
import { Icons } from '../../components/Icons';
import { ROLE_PILL, ROLE_LABELS } from '../../data/constants';
import { initials } from '../../utils/heat';
<<<<<<< HEAD
import { useApiData } from '../../hooks/useApiData';
import { usersApi } from '../../services/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../../components/States';
import { UserEditor } from '../../components/UserEditor';
import { useApp } from './AppLayout';
=======
import { usersApi } from '../../services/api';
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
import type { User, UserRole } from '../../types';

const ROLE_INFO = [
  {
    role: 'admin' as UserRole,
    title: 'Admin',
    desc: 'Acceso completo: crear/eliminar agentes, gestionar usuarios y configuración global.',
  },
  {
    role: 'tester' as UserRole,
    title: 'Tester',
    desc: 'Crear y ejecutar pruebas; editar sets y casos.',
  },
  {
    role: 'viewer' as UserRole,
    title: 'Viewer',
    desc: 'Solo lectura. Puede ver resultados y métricas.',
  },
];

export default function Users() {
<<<<<<< HEAD
  const { showToast } = useApp();
  const [editor, setEditor] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const { data, loading, error, refetch } = useApiData(
    () => usersApi.list({ limit: 100 }),
    [],
  );

  const users = data?.data ?? [];
=======
  // Estado inicial con datos vacíos para evitar useEffect
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const response = await usersApi.list({
        page: 1,
        limit: 100,
      });

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar usuarios'
      );
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  async function handleInvite() {
    try {
      const timestamp = Date.now();

      await usersApi.create({
        name: `Usuario ${timestamp}`,
        email: `usuario${timestamp}@test.com`,
        password: '12345678',
        role: 'viewer',
      });

      await loadUsers();
      alert('Usuario creado correctamente');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el usuario'
      );
    }
  }

  // Carga inicial disparada una sola vez desde el render
  if (!initialized && !loading) {
    void loadUsers();
  }

  if (loading && !initialized) {
    return (
      <div className="page">
        <p>Cargando usuarios...</p>
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
            void loadUsers();
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
          <h1 className="page-title">Usuarios</h1>
          <p className="page-sub">
            Equipo con acceso a la plataforma. Los roles controlan permisos sobre agentes, sets y métricas.
          </p>
        </div>

        <div className="page-actions">
<<<<<<< HEAD
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary" onClick={() => setEditor({ open: true, user: null })}>
=======
          <button className="btn">
            <Icons.Filter size={14} /> Filtros
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              void handleInvite();
            }}
          >
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
            <Icons.Plus size={14} /> Invitar
          </button>
        </div>
      </div>

<<<<<<< HEAD
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        {ROLE_INFO.map(r => {
          const count = users.filter(u => u.role === r.role).length;
=======
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          marginBottom: 18,
        }}
      >
        {ROLE_INFO.map((r) => {
          const count = users.filter((u) => u.role === r.role).length;

>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
          return (
            <div key={r.role} className="card">
              <div className="card-body">
                <div className="row" style={{ gap: 8 }}>
                  <span className={ROLE_PILL[r.role]}>
                    {r.title}
                  </span>

                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 18,
                      fontWeight: 500,
                      fontFamily: 'Geist Mono, monospace',
                    }}
                  >
                    {count}
                  </span>
                </div>

                <div
                  className="muted"
                  style={{ fontSize: 12.5, marginTop: 8 }}
                >
                  {r.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

<<<<<<< HEAD
      {loading && <LoadingBlock label="Cargando usuarios…" />}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && users.length === 0 && (
        <EmptyBlock title="No hay usuarios registrados" hint="Cuando alguien se registre desde Firebase, aparecerá acá." />
      )}

      {!loading && !error && users.length > 0 && (
=======
      {users.length === 0 ? (
        <div className="card">
          <div className="card-body">
            No hay usuarios registrados.
          </div>
        </div>
      ) : (
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
        <div className="card">
          <table className="table">
            <thead>
              <tr>
<<<<<<< HEAD
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
=======
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>ID</th>
                <th>Creado</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <div className="user-avatar">
                        {initials(u.name)}
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {u.name}
                      </div>
                    </div>
                  </td>

                  <td className="muted mono" style={{ fontSize: 12.5 }}>
                    {u.email}
                  </td>

                  <td>
                    <span className={ROLE_PILL[u.role as UserRole]}>
                      {ROLE_LABELS[u.role as UserRole]}
                    </span>
                  </td>

                  <td>
                    <code style={{ fontSize: 11 }}>
                      {u.id}
                    </code>
                  </td>

                  <td className="muted">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>

                  <td>
                    <button className="icon-btn">
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
                      <Icons.More size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
<<<<<<< HEAD

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
=======
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
    </div>
  );
}