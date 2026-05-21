import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import { HeatMap } from '../../components/HeatMap';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const { signIn, signUp, loading } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);

  const redirectTo = location.state?.from && location.state.from.startsWith('/app')
    ? location.state.from
    : '/app/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name || undefined);
        // Sincroniza usuario en backend (no-op si el endpoint no existe)
        await authApi.syncUser({ name, email }).catch(() => null);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message ?? 'No se pudo iniciar sesión');
    }
  }

  return (
    <div className="auth-bg">
      {/* Left panel */}
      <div className="auth-left">
        <div className="row" style={{ gap: 10 }}>
          <div className="brand-mark">BB</div>
          <div>
            <div className="brand-name">Black Box</div>
            <div className="brand-sub">Testing Platform</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '0 32px' }}>
          <form style={{ width: '100%', maxWidth: 360 }} onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              {mode === 'signin' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
            </h2>
            <p className="muted" style={{ marginTop: 8, marginBottom: 28, fontSize: 14 }}>
              {mode === 'signin'
                ? 'Inicia sesión para continuar evaluando tus agentes.'
                : 'Regístrate para empezar a evaluar agentes conversacionales.'}
            </p>

            <div className="stack" style={{ gap: 12 }}>
              <button
                type="button"
                className="btn"
                disabled
                title="Próximamente"
                style={{ padding: '10px 14px', justifyContent: 'center', fontWeight: 500, opacity: 0.55 }}
              >
                <Icons.Google size={16} /> Continuar con Google
              </button>
              <button
                type="button"
                className="btn"
                disabled
                title="Próximamente"
                style={{ padding: '10px 14px', justifyContent: 'center', fontWeight: 500, opacity: 0.55 }}
              >
                <Icons.Github size={16} /> Continuar con GitHub
              </button>
            </div>

            <div className="row" style={{ margin: '24px 0 18px', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span className="muted" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>o con email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            <div className="stack" style={{ gap: 12 }}>
              {mode === 'signup' && (
                <div className="field">
                  <label>Nombre</label>
                  <input
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tu nombre"
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <div className="row">
                  <label>Contraseña</label>
                  {mode === 'signin' && (
                    <a href="#" className="muted" style={{ fontSize: 12, marginLeft: 'auto', textDecoration: 'none' }}>
                      ¿Olvidaste?
                    </a>
                  )}
                </div>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </div>

              {error && (
                <div style={{
                  padding: '8px 10px', borderRadius: 6, fontSize: 12.5,
                  background: 'rgba(213, 71, 71, 0.08)', color: 'var(--red)',
                  border: '1px solid rgba(213, 71, 71, 0.25)',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-accent"
                disabled={loading}
                style={{ padding: '9px 14px', justifyContent: 'center', fontWeight: 500 }}
              >
                {loading
                  ? 'Procesando…'
                  : mode === 'signin' ? <>Iniciar sesión <Icons.Arrow size={14} /></> : <>Crear cuenta <Icons.Arrow size={14} /></>}
              </button>
            </div>

            <p className="muted" style={{ fontSize: 12.5, marginTop: 22, textAlign: 'center' }}>
              {mode === 'signin' ? (
                <>
                  ¿Aún no tienes cuenta?{' '}
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); setMode('signup'); setError(null); }}
                    style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}
                  >
                    Crear cuenta
                  </a>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); setMode('signin'); setError(null); }}
                    style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}
                  >
                    Iniciar sesión
                  </a>
                </>
              )}
            </p>
          </form>
        </div>

        <div className="row muted" style={{ fontSize: 11.5, gap: 16 }}>
          <span>© 2026 Black Box Testing</span>
          <span style={{ marginLeft: 'auto' }}>Auth · Firebase</span>
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div>
          <span className="pill" style={{ background: 'var(--bg)', padding: '3px 9px' }}>
            <Icons.Sparkles size={10} /> Plataforma para evaluación de LLMs
          </span>
        </div>

        <div style={{ paddingBottom: 40 }}>
          <div className="serif" style={{ fontSize: 38, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--ink)', maxWidth: 520 }}>
            <em>Evalúa, compara y monitorea</em> tus agentes conversacionales con suites de pruebas reproducibles.
          </div>

          <div style={{ marginTop: 36, padding: '16px 18px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8 }}>
            <div className="row" style={{ marginBottom: 10, fontSize: 12, color: 'var(--ink-3)' }}>
              <span style={{ fontWeight: 500, color: 'var(--ink-2)' }}>Triage — Síntomas Respiratorios</span>
              <span className="pill pill-green" style={{ marginLeft: 'auto' }}>81%</span>
            </div>
            <HeatMap total={42} passRate={0.81} fails={8} height={22} />
            <div className="row" style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'Geist Mono, monospace' }}>
              <span>42 tests</span>
              <span style={{ marginLeft: 'auto' }}>1m 42s</span>
            </div>
          </div>

          <div className="row" style={{ marginTop: 24, gap: 30, fontSize: 12 }}>
            {[
              { val: '248', label: 'ejecuciones/semana' },
              { val: '4',   label: 'agentes activos' },
              { val: '84.2%', label: 'pass rate global' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 20, fontWeight: 500, fontFamily: 'Geist Mono, monospace' }}>{s.val}</div>
                <div className="muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="muted" style={{ fontSize: 11.5 }}>
          Protegido por Firebase Authentication · MongoDB Atlas
        </div>
      </div>
    </div>
  );
}
