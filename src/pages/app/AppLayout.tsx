import { useState, createContext, useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import { Toast } from '../../components/Toast';
import { TestEditor } from '../../components/TestEditor';
import { RunInProgress } from '../../components/RunInProgress';
import type { Test, TestSet } from '../../types';
import { MOCK_AGENTS, MOCK_TEST_SETS } from '../../data/mockData';
import { initials } from '../../utils/heat';

/* ── App context — shared state across all pages ── */
interface AppCtx {
  showToast: (msg: string) => void;
  openTestEditor: (test: Test | null) => void;
  startRun: (testSet: TestSet) => void;
}
const Ctx = createContext<AppCtx>({ showToast: () => {}, openTestEditor: () => {}, startRun: () => {} });
export const useApp = () => useContext(Ctx);

const NAV = [
  { to: '/app/dashboard', label: 'Resumen',      Icon: Icons.Dashboard },
  { to: '/app/agents',    label: 'Agentes',       Icon: Icons.Bot },
  { to: '/app/test-sets', label: 'Sets de prueba', Icon: Icons.Layers },
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
    const id = parts[2];
    const agent = MOCK_AGENTS.find(a => a.id === id);
    const ts = MOCK_TEST_SETS.find(s => s.id === id);
    crumbs.push({ label: agent?.name ?? ts?.name ?? id });
  }
  return crumbs;
}

const ME = { name: 'Juan Erazo', email: 'juan@uao.edu.co', role: 'admin' };

export default function AppLayout() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [testEditor, setTestEditor] = useState<{ open: boolean; test: Test | null }>({ open: false, test: null });
  const [runningSet, setRunningSet] = useState<TestSet | null>(null);
  const crumbs = useCrumbs();

  const activeCount = MOCK_AGENTS.filter(a => a.status === 'active').length;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function openTestEditor(test: Test | null) {
    setTestEditor({ open: true, test });
  }

  function startRun(testSet: TestSet) {
    setRunningSet(testSet);
  }

  return (
    <Ctx.Provider value={{ showToast, openTestEditor, startRun }}>
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
                {({ isActive }) => (
                  <>
                    <Icon size={15} className="ico" />
                    <span>{label}</span>
                    {to === '/app/agents' && (
                      <span className={`count${isActive ? '' : ''}`}>{activeCount}</span>
                    )}
                    {to === '/app/test-sets' && (
                      <span className="count">{MOCK_TEST_SETS.length}</span>
                    )}
                    {to === '/app/runs' && (
                      <span className="count">6</span>
                    )}
                    {to === '/app/metrics' && (
                      <span className="count">6</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <nav className="nav-section" style={{ marginTop: 6 }}>
            <div className="nav-label">Cuenta</div>
            <div className="nav-item" onClick={() => navigate('/login')}>
              <Icons.Logout size={15} className="ico" />
              <span>Cerrar sesión</span>
            </div>
            <div className="nav-item">
              <Icons.Cog size={15} className="ico" />
              <span>Configuración</span>
            </div>
          </nav>

          <div className="sidebar-foot">
            <div className="user-avatar">{initials(ME.name)}</div>
            <div className="user-info">
              <div className="user-name">{ME.name}</div>
              <div className="user-role">{ME.email}</div>
            </div>
            <button className="icon-btn"><Icons.ChevDown size={14} /></button>
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
              <button className="btn btn-sm">
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
          onClose={() => setTestEditor({ open: false, test: null })}
          onSave={() => showToast(testEditor.test ? 'Test actualizado' : 'Test creado')}
        />
      )}

      {runningSet && (
        <RunInProgress
          testSet={runningSet}
          onClose={() => setRunningSet(null)}
          onComplete={() => {
            setRunningSet(null);
            showToast('Ejecución completada');
          }}
        />
      )}
    </Ctx.Provider>
  );
}
