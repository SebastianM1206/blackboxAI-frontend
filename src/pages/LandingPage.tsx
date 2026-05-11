import { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    let t = (s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CURL_CODE = [
  '<span class="c"># Lanzar una ejecución contra una nueva versión del agente</span>',
  'curl -X <span class="k">POST</span> https://api.blackbox.ai/v1/test-sets/<span class="v">billing-suite</span>/runs \\',
  '  -H <span class="s">"Authorization: Bearer $BB_TOKEN"</span> \\',
  '  -H <span class="s">"Content-Type: application/json"</span> \\',
  "  -d '{",
  '    <span class="v">"agent_id"</span>: <span class="s">"agent-billing"</span>,',
  '    <span class="v">"agent_version"</span>: <span class="s">"v3.3.0-rc.1"</span>,',
  '    <span class="v">"parallelism"</span>: <span class="n">16</span>,',
  '    <span class="v">"metrics"</span>: [<span class="s">"faithfulness"</span>, <span class="s">"format"</span>, <span class="s">"latency"</span>]',
  "  }'",
  '',
  '<span class="c"># → 202 Accepted</span>',
  '{',
  '  <span class="v">"run_id"</span>: <span class="s">"run_8a4f2c91"</span>,',
  '  <span class="v">"status"</span>: <span class="s">"queued"</span>,',
  '  <span class="v">"cases_total"</span>: <span class="n">240</span>,',
  '  <span class="v">"estimated_seconds"</span>: <span class="n">94</span>',
  '}',
].join('\n');

export default function LandingPage() {
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
  };

  const heroHeat = useMemo(() => {
    const rnd = mulberry32(42);
    return Array.from({ length: 80 }, (_, i) => {
      const r = rnd();
      return { i, cls: r < 0.04 ? 'fail' : r < 0.10 ? 'partial' : 'pass' };
    });
  }, []);

  const featHeat = useMemo(() => {
    const rnd = mulberry32(7);
    return Array.from({ length: 100 }, (_, i) => {
      const r = rnd();
      const cls = r < 0.05 ? 'f' : r < 0.12 ? 'p' : r > 0.97 ? 's' : '';
      return { i, cls };
    });
  }, []);

  const stepHeat2 = useMemo(() => {
    const rnd = mulberry32(99);
    return Array.from({ length: 64 }, (_, i) => {
      const r = rnd();
      const cls = r < 0.08 ? 'f' : r < 0.18 ? 'a' : r < 0.78 ? 'p' : '';
      return { i, cls };
    });
  }, []);

  return (
    <div className="lp">

      {/* ── Nav ── */}
      <nav className="nav" ref={navRef}>
        <div className="container nav-inner">
          <a className="logo" href="/">
            <img src="/blackbox-logo-trim.png" alt="blackbox AI" />
          </a>
          <div className="nav-links">
            <a className="nav-link" href="#producto" onClick={goTo('producto')}>Producto</a>
            <a className="nav-link" href="#caracteristicas" onClick={goTo('caracteristicas')}>Características</a>
            <a className="nav-link" href="#api" onClick={goTo('api')}>API</a>
            <a className="nav-link" href="#precios" onClick={goTo('precios')}>Precios</a>
          </div>
          <div className="nav-cta">
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Probar gratis
              <svg className="arr" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" id="producto">
        <div className="container hero-inner">
          <span className="eyebrow">
            <span className="tag">v2.0</span>
            Nueva: ejecución paralela y métricas LLM-as-judge
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </span>
          <h1>Pruebas confiables para <span className="accent">agentes de IA</span>.</h1>
          <p className="hero-lede">
            Define sets de prueba, ejecútalos contra cualquier agente y mide calidad con métricas
            personalizadas. Itera sobre versiones con la confianza de que no romperás producción.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Empezar gratis
              <svg className="arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
            <a className="btn btn-lg" href="#api" onClick={goTo('api')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Ver documentación
            </a>
            <span className="hero-meta">
              <span className="dot" />
              API en línea · 99.97% uptime
            </span>
          </div>

          {/* Product preview */}
          <div className="hero-preview">
            <div className="preview-frame">
              <div className="preview-bar">
                <div className="preview-dots"><span /><span /><span /></div>
                <div className="preview-url">
                  <svg className="lock" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  app.blackbox.ai/resumen
                </div>
              </div>

              <div className="mock">
                <aside className="mock-side">
                  <div className="grp">Plataforma</div>
                  <div className="item active"><span className="ic" /> Resumen</div>
                  <div className="item"><span className="ic" /> Agentes <span className="ct">12</span></div>
                  <div className="item"><span className="ic" /> Sets de prueba <span className="ct">34</span></div>
                  <div className="item"><span className="ic" /> Ejecuciones <span className="ct">218</span></div>
                  <div className="item"><span className="ic" /> Métricas <span className="ct">9</span></div>
                  <div className="grp">Cuenta</div>
                  <div className="item"><span className="ic" /> Usuarios</div>
                  <div className="item"><span className="ic" /> Configuración</div>
                </aside>

                <div className="mock-main">
                  <h3 className="mock-h1">Resumen</h3>
                  <div className="mock-sub">Salud de tus agentes y últimas ejecuciones · hoy, 14:32</div>

                  <div className="mock-kpis">
                    <div className="mock-kpi">
                      <div className="l">Tasa global</div>
                      <div className="v">94.2<span style={{ fontSize: '.6em', color: 'var(--ink-3)' }}>%</span></div>
                      <div className="d up">+2.1 vs ayer</div>
                      <svg className="spark" width="100%" height="22" viewBox="0 0 120 22" preserveAspectRatio="none">
                        <polyline fill="none" stroke="#0f7a4d" strokeWidth="1.5" points="0,16 10,14 20,15 30,12 40,13 50,10 60,11 70,8 80,9 90,6 100,7 110,4 120,5"/>
                      </svg>
                    </div>
                    <div className="mock-kpi">
                      <div className="l">Tests ejecutados</div>
                      <div className="v">12.482</div>
                      <div className="d up">+318 hoy</div>
                      <svg className="spark" width="100%" height="22" viewBox="0 0 120 22" preserveAspectRatio="none">
                        <polyline fill="none" stroke="#16140f" strokeWidth="1.5" points="0,18 12,16 24,14 36,15 48,12 60,11 72,10 84,12 96,8 108,7 120,5"/>
                      </svg>
                    </div>
                    <div className="mock-kpi">
                      <div className="l">Latencia p50</div>
                      <div className="v">842<span style={{ fontSize: '.6em', color: 'var(--ink-3)' }}>ms</span></div>
                      <div className="d dn">+34ms</div>
                      <svg className="spark" width="100%" height="22" viewBox="0 0 120 22" preserveAspectRatio="none">
                        <polyline fill="none" stroke="#b8311b" strokeWidth="1.5" points="0,12 12,13 24,11 36,14 48,15 60,12 72,16 84,15 96,17 108,16 120,18"/>
                      </svg>
                    </div>
                    <div className="mock-kpi">
                      <div className="l">Costo / 1k</div>
                      <div className="v">$0.18</div>
                      <div className="d up">-12%</div>
                      <svg className="spark" width="100%" height="22" viewBox="0 0 120 22" preserveAspectRatio="none">
                        <polyline fill="none" stroke="#0f7a4d" strokeWidth="1.5" points="0,8 12,9 24,11 36,10 48,12 60,13 72,12 84,14 96,15 108,16 120,17"/>
                      </svg>
                    </div>
                  </div>

                  <div className="mock-card">
                    <div className="mock-card-h">
                      <div className="t">Heatmap · agent-billing-v3.2 · últimas 240 pruebas</div>
                      <div className="pill">94.2% pasaron</div>
                    </div>
                    <div className="heat">
                      {heroHeat.map(({ i, cls }) => <div key={i} className={`heat-cell ${cls}`} />)}
                    </div>
                  </div>

                  <div className="mock-card">
                    <div className="mock-card-h">
                      <div className="t">Ejecuciones recientes</div>
                      <div className="pill">218</div>
                    </div>
                    <div className="mock-rows">
                      <div className="r">
                        <span className="dot" style={{ background: 'var(--green)' }} />
                        <span className="name">Onboarding · suite completa</span>
                        <span className="meta">v3.2.1</span><span className="meta">2m 18s</span>
                        <span className="pill-tiny pt-green">142/142</span>
                      </div>
                      <div className="r">
                        <span className="dot" style={{ background: 'var(--amber)' }} />
                        <span className="name">Billing · regresión</span>
                        <span className="meta">v3.2.0</span><span className="meta">1m 04s</span>
                        <span className="pill-tiny pt-amber">86/89</span>
                      </div>
                      <div className="r">
                        <span className="dot" style={{ background: 'var(--red)' }} />
                        <span className="name">Soporte L1 · adversarial</span>
                        <span className="meta">v2.8.3</span><span className="meta">3m 41s</span>
                        <span className="pill-tiny pt-red">38/52</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="annot annot-1 green">+12 ejecuciones · ahora</div>
            <div className="annot annot-2"><span className="k">p50</span><span className="v">842ms</span></div>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <div className="container trust">
        <div className="trust-label">Equipos de IA en LATAM confían en nosotros</div>
        <div className="trust-logos">
          <div className="tlogo t1"><span className="mk" /> Helix</div>
          <div className="tlogo t2"><span className="mk" /> Soma Labs</div>
          <div className="tlogo t3"><span className="mk" /> Corteza AI</div>
          <div className="tlogo t4"><span className="mk" /> Norte</div>
          <div className="tlogo t5"><span className="mk" /> Vector·co</div>
        </div>
      </div>

      {/* ── Features ── */}
      <section id="caracteristicas">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">{'// CARACTERÍSTICAS'}</div>
            <h2>Todo lo que tu equipo necesita para <span className="accent">iterar sin miedo</span>.</h2>
            <p>Una superficie limpia para definir agentes, sets de prueba y métricas; un motor robusto para ejecutarlos y comparar versiones.</p>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feat-ico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/></svg>
              </div>
              <h3 className="feat-h">Agentes versionados</h3>
              <p className="feat-p">Provider, modelo y versión bajo control. Comparte agentes entre equipos sin romper compatibilidad.</p>
              <div className="feat-viz viz-agents">
                <div className="vrow"><span className="av a1">CL</span><span className="nm">agent-onboarding</span><span className="vr">v3.2.1</span></div>
                <div className="vrow"><span className="av a2">GP</span><span className="nm">agent-billing</span><span className="vr">v2.8.0</span></div>
                <div className="vrow"><span className="av a3">LL</span><span className="nm">agent-support-l1</span><span className="vr">v1.4.2</span></div>
              </div>
            </div>

            <div className="feature wide">
              <div className="feat-ico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              </div>
              <h3 className="feat-h">Sets de prueba con resultados visuales</h3>
              <p className="feat-p">Organiza casos por categoría, prioridad y propietario. Ve de un vistazo qué pasó, qué falló y qué se volvió flaky en tu última iteración.</p>
              <div className="feat-viz viz-heat">
                <div className="viz-heat-h">
                  <span>240 casos · billing-suite-v3</span>
                  <span className="pct">94.2%</span>
                </div>
                <div className="viz-heat-grid">
                  {featHeat.map(({ i, cls }) => <div key={i} className={cls} />)}
                </div>
              </div>
            </div>

            <div className="feature">
              <div className="feat-ico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 16l4-6 4 3 5-8"/></svg>
              </div>
              <h3 className="feat-h">Métricas personalizadas</h3>
              <p className="feat-p">Faithfulness, formato, exactitud, tono. Define la métrica que importa con código o LLM-as-judge.</p>
              <div className="feat-viz viz-metric">
                <div className="mblock"><div className="ml">Faithfulness</div><div className="mv">0.91</div><div className="mt up">↑ 0.04</div></div>
                <div className="mblock"><div className="ml">Format</div><div className="mv">98%</div><div className="mt up">↑ 2pp</div></div>
                <div className="mblock"><div className="ml">Latency</div><div className="mv">842ms</div><div className="mt dn">↓ 34ms</div></div>
                <div className="mblock"><div className="ml">Cost / 1k</div><div className="mv">$0.18</div><div className="mt up">↓ 12%</div></div>
              </div>
            </div>

            <div className="feature">
              <div className="feat-ico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="feat-h">Roles y permisos</h3>
              <p className="feat-p">Admin, tester y viewer. Onboarding seguro con Firebase Auth, SSO y auditoría.</p>
              <div className="feat-viz viz-roles">
                <div className="rrow"><span className="rk">Admin</span><span className="rp">3 usuarios</span></div>
                <div className="rrow"><span className="rk">Tester</span><span className="rp">12 usuarios</span></div>
                <div className="rrow"><span className="rk">Viewer</span><span className="rp">9 usuarios</span></div>
              </div>
            </div>

            <div className="feature">
              <div className="feat-ico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <h3 className="feat-h">API-first</h3>
              <p className="feat-p">REST documentada con OpenAPI. Dispara ejecuciones desde tu CI/CD en cualquier lenguaje.</p>
              <div className="feat-viz viz-code">
                <span className="c"># Ejecutar suite contra una versión nueva</span><br />
                <span className="k">POST</span> /api/v1/runs<br />
                {'  '}<span className="v">"test_set"</span>{': '}<span className="s">"billing-suite"</span>,<br />
                {'  '}<span className="v">"agent_version"</span>{': '}<span className="s">"v3.3.0-rc.1"</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <div className="workflow">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">{'// CÓMO FUNCIONA'}</div>
            <h2>De idea a versión en producción, en tres pasos.</h2>
            <p>Diseñado para que ML engineers y prompt engineers iteren rápido sin sacrificar rigor.</p>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Define tus agentes y sets</h3>
              <p>Crea agentes con su provider, modelo y versión. Agrupa casos en sets de prueba con categoría y prioridad.</p>
              <div className="step-viz">
                <span className="ln"><span className="c"># test-set.yaml</span></span>
                <span className="ln"><span className="k">name:</span> <span className="s">billing-suite</span></span>
                <span className="ln"><span className="k">cases:</span> <span className="s">240</span></span>
                <span className="ln"><span className="k">priority:</span> <span className="s">high</span></span>
                <span className="ln"><span className="k">metrics:</span> {'['}<span className="s">faithfulness</span>, <span className="s">format</span>{']'}</span>
              </div>
            </div>
            <div className="step">
              <h3>Ejecuta en paralelo</h3>
              <p>Corre cientos de casos en segundos. Compara versiones de agente lado a lado y detecta regresiones.</p>
              <div className="step-viz viz2">
                {stepHeat2.map(({ i, cls }) => <div key={i} className={cls} />)}
              </div>
            </div>
            <div className="step">
              <h3>Mide e itera</h3>
              <p>Visualiza métricas, identifica casos rotos y promueve la nueva versión con confianza.</p>
              <div className="step-viz viz3">
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: '#a39c8b' }}>Score por categoría</div>
                <div className="gauge">
                  {[64, 82, 72, 91, 78, 88, 94, 69].map((h, i) => (
                    <div key={i} className="b" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-band">
        <div className="container stats">
          <div className="stat-cell">
            <div className="v">12<span className="accent">M</span>+</div>
            <div className="l">Tests ejecutados este año</div>
          </div>
          <div className="stat-cell">
            <div className="v">99.97<span className="accent">%</span></div>
            <div className="l">Uptime del API en los últimos 90 días</div>
          </div>
          <div className="stat-cell">
            <div className="v">~<span className="accent">240</span>ms</div>
            <div className="l">Latencia media por evaluación</div>
          </div>
          <div className="stat-cell">
            <div className="v">42<span className="accent">×</span></div>
            <div className="l">Más rápido que evaluar a mano</div>
          </div>
        </div>
      </div>

      {/* ── API ── */}
      <section id="api">
        <div className="container api">
          <div className="api-side">
            <div className="section-eyebrow">{'// API'}</div>
            <h2>Una API que <span className="accent">se siente como tu IDE</span>.</h2>
            <p>REST limpia, errores predecibles, paginación consistente. Documentada con OpenAPI 3.1, lista para autogenerar clientes en TypeScript, Python o Go.</p>
            <div className="api-features">
              {[
                { t: 'Autenticación con Firebase', d: 'Token JWT en cada request. Integración con tu IdP existente vía SSO.' },
                { t: 'Webhooks de ejecución',      d: 'Recibe el resultado en tu CI/CD cuando una ejecución termina.' },
                { t: 'Rate limits generosos',      d: '1000 req/min por proyecto en el plan Pro. Sin sorpresas.' },
              ].map(({ t, d }) => (
                <div key={t} className="api-feat">
                  <span className="chk">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <div>
                    <div className="t">{t}</div>
                    <div className="d">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="codeblock">
            <div className="codeblock-head">
              <span className="lang">cURL</span>
              <span className="ttl">{'POST /api/v1/test-sets/{id}/runs'}</span>
              <button className="copy" onClick={() => navigator.clipboard?.writeText('curl ...')}>Copiar</button>
            </div>
            <pre dangerouslySetInnerHTML={{ __html: CURL_CODE }} />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-band" id="precios">
        <div className="container">
          <h2>Itera sobre tus agentes con la <span className="accent">confianza</span> de un equipo grande.</h2>
          <p>Prueba blackbox AI gratis hasta 1.000 ejecuciones al mes. Sin tarjeta, sin trampas.</p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Empezar gratis
              <svg className="arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
            <button className="btn btn-lg">Hablar con ventas</button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer>
        <div className="container">
          <div className="ft-top">
            <div className="ft-brand">
              <a className="logo" href="/">
                <img src="/blackbox-logo-trim.png" alt="blackbox AI" style={{ height: 24 }} />
              </a>
              <p>Plataforma de pruebas para agentes de IA. Construida para equipos que iteran rápido.</p>
            </div>
            <div className="ft-col">
              <h4>Producto</h4>
              <ul>
                <li><a href="#caracteristicas" onClick={goTo('caracteristicas')}>Características</a></li>
                <li><a href="#precios" onClick={goTo('precios')}>Precios</a></li>
                <li><a href="#api" onClick={goTo('api')}>API</a></li>
                <li><a href="#">Integraciones</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>
            <div className="ft-col">
              <h4>Recursos</h4>
              <ul>
                <li><a href="#">Documentación</a></li>
                <li><a href="#">Guías</a></li>
                <li><a href="#">Ejemplos</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
            <div className="ft-col">
              <h4>Compañía</h4>
              <ul>
                <li><a href="#">Sobre nosotros</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Empleos</a></li>
                <li><a href="#">Contacto</a></li>
              </ul>
            </div>
            <div className="ft-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacidad</a></li>
                <li><a href="#">Términos</a></li>
                <li><a href="#">Seguridad</a></li>
                <li><a href="#">DPA</a></li>
              </ul>
            </div>
          </div>
          <div className="ft-bot">
            <span>© 2026 blackbox AI · Cali, Colombia</span>
            <div className="right">
              <a href="#">Twitter</a>
              <a href="#">GitHub</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
