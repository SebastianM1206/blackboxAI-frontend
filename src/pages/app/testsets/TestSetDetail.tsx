import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { useApp } from '../AppLayout';
import { MOCK_TEST_SETS, MOCK_TESTS } from '../../../data/mockData';
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_PILL } from '../../../data/constants';
import type { TestSet, Test, TestCategory, TestPriority } from '../../../types';

function buildSyntheticTests(testSet: TestSet, real: Test[]): Test[] {
  const extra = Array.from({ length: Math.max(0, (testSet.testCount ?? 0) - real.length) }, (_, i) => ({
    id: `synth_${testSet.id}_${i}`,
    input: `Caso de prueba #${real.length + i + 1} — entrada de prueba sintética para validación`,
    expectedOutput: 'Respuesta esperada del agente conforme a las políticas definidas.',
    category: (['greeting','faq','error_handling','intent_recognition','context_retention','edge_case'] as TestCategory[])[i % 6],
    priority: (['low','medium','high','critical'] as TestPriority[])[i % 4],
    testSetId: testSet.id,
    lastResult: (Math.random() < (testSet.passRate ?? 0.8) ? 'pass' : Math.random() < 0.4 ? 'partial' : 'fail') as Test['lastResult'],
  }));
  return [...real, ...extra];
}

export default function TestSetDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { testSet?: TestSet } };
  const { openTestEditor, startRun } = useApp();

  const testSet = state?.testSet ?? MOCK_TEST_SETS.find(s => s.id === id) ?? MOCK_TEST_SETS[0];
  const realTests = MOCK_TESTS.filter(t => t.testSetId === testSet.id);
  const allTests = buildSyntheticTests(testSet, realTests);
  const criticalCount = allTests.filter(t => t.priority === 'critical').length;

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/test-sets')} style={{ marginBottom: 12 }}>
        <Icons.Chevron size={12} style={{ transform: 'rotate(180deg)' }} /> Sets de prueba
      </button>

      <div className="page-head">
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{testSet.name}</h1>
          <p className="page-sub">{testSet.description}</p>
          <div className="row" style={{ marginTop: 10, gap: 18, fontSize: 12.5, color: 'var(--ink-3)' }}>
            <span><span className="muted">Agente:</span> <strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{testSet.agentName}</strong></span>
            <span>·</span>
            <span><span className="muted">ID</span> <code style={{ fontSize: 11 }}>{testSet.id}</code></span>
            <span>·</span>
            <span>Creado por <strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{testSet.createdBy}</strong></span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Edit size={14} /> Editar</button>
          <button className="btn btn-accent" onClick={() => startRun(testSet)}>
            <Icons.PlayOutline size={14} /> Ejecutar set
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
        <div className="card stat"><div className="lbl">Tests</div><div className="val">{allTests.length}</div></div>
        <div className="card stat"><div className="lbl">Última pass rate</div><div className="val">{Math.round((testSet.passRate ?? 0) * 100)}%</div></div>
        <div className="card stat"><div className="lbl">Tests críticos</div><div className="val">{criticalCount}</div></div>
        <div className="card stat"><div className="lbl">Última ejecución</div><div className="val" style={{ fontSize: 17, fontWeight: 500 }}>{testSet.lastRun}</div></div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Casos de prueba</h3>
          <span className="muted" style={{ fontSize: 12 }}>{allTests.length} tests</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn btn-sm"><Icons.Filter size={12} /> Categoría</button>
            <button className="btn btn-sm"><Icons.Filter size={12} /> Prioridad</button>
            <button className="btn btn-sm btn-primary" onClick={() => openTestEditor(null)}>
              <Icons.Plus size={12} /> Nuevo test
            </button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 30 }} /><th>Input</th><th>Output esperado</th>
              <th>Categoría</th><th>Prioridad</th><th>Último resultado</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {allTests.slice(0, 14).map(t => (
              <tr key={t.id} onClick={() => openTestEditor(t)}>
                <td>
                  <span className={`pill ${t.lastResult === 'pass' ? 'pill-green' : t.lastResult === 'fail' ? 'pill-red' : 'pill-amber'}`} style={{ padding: '1px 5px' }}>
                    {t.lastResult === 'pass' ? <Icons.Check size={10} /> : t.lastResult === 'fail' ? <Icons.X size={10} /> : <Icons.Dot size={10} />}
                  </span>
                </td>
                <td><div className="truncate" style={{ maxWidth: 280, fontFamily: 'Geist Mono, monospace', fontSize: 12.5 }}>{t.input}</div></td>
                <td><div className="truncate muted" style={{ maxWidth: 320, fontFamily: 'Geist Mono, monospace', fontSize: 12.5 }}>{t.expectedOutput}</div></td>
                <td><span className="pill">{CATEGORY_LABELS[t.category as TestCategory]}</span></td>
                <td><span className={PRIORITY_PILL[t.priority as TestPriority]}>{PRIORITY_LABELS[t.priority as TestPriority]}</span></td>
                <td><span className="muted" style={{ fontSize: 12 }}>{t.lastResult === 'pass' ? 'Pasó' : t.lastResult === 'fail' ? 'Falló' : 'Parcial'}</span></td>
                <td><button className="icon-btn" onClick={e => e.stopPropagation()}><Icons.More size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
