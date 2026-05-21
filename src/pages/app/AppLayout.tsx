import { useState, createContext, useContext, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import { Toast } from '../../components/Toast';
import { TestEditor } from '../../components/TestEditor';
import { RunInProgress } from '../../components/RunInProgress';
import type { Test, TestSet } from '../../types';
import { initials } from '../../utils/heat';
import { useAuth } from '../../contexts/AuthContext';
import { agentsApi, testSetsApi } from '../../services/api';

/* ── App context — shared state across all pages ── */
interface AppCtx {
  showToast: (msg: string) => void;
  openTestEditor: (test: Test | null, opts?: { testSetId?: string; onSaved?: () => void }) => void;
  startRun: (testSet: TestSet, opts?: { onCompleted?: () => void }) => void;
  refreshSidebar: () => void;
}
const Ctx = createContext<AppCtx>({
  showToast: () => {},
  openTestEditor: () => {},
  startRun: () => {},
  refreshSidebar: () => {},
});
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(Ctx);

const NAV = [
  { to: '/app/dashboard', label: 'Resumen',       Icon: Icons.Dashboard },
  { to: '/app/agents',    label: 'Agentes',       Icon: Icons.Bot },
  { to: '/app/test-sets', label: 'Sets de prueba',Icon: Icons.Layers },
  { to: '/app/runs',      label: 'Ejecuciones',   Icon: Icons.Play },
  { to: '/app/metrics',   label: 'Métricas',      Icon: Icons.Gauge },
  { to: '/app/users',     label: 'Usuarios',      Icon: Icons.Users },
];

const CRUMB_MAP: Record<string, string> = {
  '/app/dashboard': 'Resumen',
  '/app/agents': 'Agentes',
  '/app/test-sets': 'Sets de prueba',
  '/app/runs': 'Ejecuciones',
  '/app/metrics': 'Métricas',
  '/app/users': 'Usuarios',
};

function useCrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];

  if (parts.length >= 2) {
    const base = `/${parts[0]}/${parts[1]}`;
    crumbs.push({ label: CRUMB_MAP[base] ?? parts[1], href: parts.length > 2 ? base : undefined });
  }
  if (parts.length >= 3) {
    crumbs.push({ label: parts[2] });
  }
  return crumbs;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [testEditor, setTestEditor] = useState<{
    open: boolean; test: Test | null; testSetId?: string; onSaved?: () => void;
  }>({ open: false, test: null });
  const [runningSet, setRunningSet] = useState<{ set: TestSet; onCompleted?: () => void } | null>(null);
  const crumbs = useCrumbs();

  // counts cargados desde la API
  const [activeAgents, setActiveAgents] = useState<number | null>(null);
  const [totalSets, setTotalSets]       = useState<number | null>(null);
  const [reloadTick, setReloadTick]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      agentsApi.list({ status: 'active', limit: 1 }),
      testSetsApi.list({ limit: 1 }),
    ]).then(([a, s]) => {
      if (cancelled) return;
      if (a.status === 'fulfilled') setActiveAgents(a.value.pagination?.total ?? 0);
      if (s.status === 'fulfilled') setTotalSets(s.value.pagination?.total ?? 0);
    });
    return () => { cancelled = true; };
  }, [reloadTick]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function openTestEditor(test: Test | null, opts?: { testSetId?: string; onSaved?: () => void }) {
    setTestEditor({ open: true, test, testSetId: opts?.testSetId, onSaved: opts?.onSaved });
  }

  function startRun(testSet: TestSet, opts?: { onCompleted?: () => void }) {
    setRunningSet({ set: testSet, onCompleted: opts?.onCompleted });
  }

  function logout() {
    signOut();
    navigate('/login', { replace: true });
  }

  const displayName  = user?.displayName || user?.email || 'Cuenta';
  const displayEmail = user?.email ?? '';

  return (
    <Ctx.Provider value={{ showToast, openTestEditor, startRun, refreshSidebar: () => setReloadTick(t => t + 1) }}>
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">BB</div>
            <div>
              <div className="brand-name">Black Box</div>
              <div className="brand-sub">Testing Platform</div>
            </div>
          </div>

          <div className="sidebar-org">
            <div className="org-avatar">UA</div>
            <div className="org-name">UAO · Equipo QA</div>
            <Icons.ChevDown size={14} className="org-chev" />
          </div>

          <nav className="nav-section">
            <div className="nav-label">Plataforma</div>
            {NAV.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <>
                  <Icon size={15} className="ico" />
                  <span>{label}</span>
                  {to === '/app/agents' && activeAgents !== null && (
                    <span className="count">{activeAgents}</span>
                  )}
                  {to === '/app/test-sets' && totalSets !== null && (
                    <span className="count">{totalSets}</span>
                  )}
                </>
              </NavLink>
            ))}
          </nav>

          <nav className="nav-section" style={{ marginTop: 6 }}>
            <div className="nav-label">Cuenta</div>
            <div className="nav-item" onClick={logout} style={{ cursor: 'pointer' }}>
              <Icons.Logout size={15} className="ico" />
              <span>Cerrar sesión</span>
            </div>
            <div className="nav-item">
              <Icons.Cog size={15} className="ico" />
              <span>Configuración</span>
            </div>
          </nav>

          <div className="sidebar-foot">
            <div className="user-avatar">{initials(displayName)}</div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-role">{displayEmail}</div>
            </div>
            <button className="icon-btn" onClick={logout} title="Cerrar sesión">
              <Icons.Logout size={14} />
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="crumbs">
              {crumbs.map((c, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {i > 0 && <Icons.Chevron size={12} className="sep" />}
                  {c.href
                    ? <span style={{ cursor: 'pointer', color: 'var(--ink-3)' }} onClick={() => navigate(c.href!)}>{c.label}</span>
                    : <span className="leaf">{c.label}</span>
                  }
                </span>
              ))}
            </div>
            <div className="topbar-actions">
              <div className="search">
                <Icons.Search size={13} />
                <span>Buscar agentes, tests, ejecuciones...</span>
                <span className="k">⌘K</span>
              </div>
              <button className="icon-btn"><Icons.Bell size={15} /></button>
              <div style={{ width: 1, height: 22, background: 'var(--line)' }} />
              <button className="btn btn-sm" onClick={() => navigate('/app/test-sets')}>
                <Icons.PlayOutline size={12} /> Ejecutar suite
              </button>
            </div>
          </div>

          <div className="content">
            <Outlet />
          </div>
        </main>
      </div>

      {toast && <Toast message={toast} />}

      {testEditor.open && (
        <TestEditor
          test={testEditor.test}
          testSetId={testEditor.testSetId}
          onClose={() => setTestEditor({ open: false, test: null })}
          onSaved={() => {
            showToast(testEditor.test ? 'Test actualizado' : 'Test creado');
            testEditor.onSaved?.();
            setTestEditor({ open: false, test: null });
          }}
          onDeleted={() => {
            showToast('Test eliminado');
            testEditor.onSaved?.();
            setTestEditor({ open: false, test: null });
          }}
        />
      )}

      {runningSet && (
        <RunInProgress
          testSet={runningSet.set}
          onClose={() => setRunningSet(null)}
          onComplete={() => {
            const cb = runningSet.onCompleted;
            setRunningSet(null);
            showToast('Ejecución completada');
            cb?.();
          }}
        />
      )}
    </Ctx.Provider>
  );
}
