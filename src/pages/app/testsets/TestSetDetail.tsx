import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { useApp } from '../AppLayout';
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_PILL } from '../../../data/constants';
import { useApiData } from '../../../hooks/useApiData';
import { testSetsApi, testsApi } from '../../../services/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../../../components/States';
import { TestSetEditor } from '../../../components/TestSetEditor';
import type { TestSet, TestCategory, TestPriority } from '../../../types';

export default function TestSetDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { testSet?: TestSet } };
  const { openTestEditor, startRun, showToast, refreshSidebar } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);

  const { data: setRes, loading: loadingSet, error: errSet, refetch: refetchSet } = useApiData(
    () => testSetsApi.get(id!),
    [id],
  );
  const testSet = setRes?.data ?? state?.testSet;

  const { data: testsRes, loading: loadingTests, error: errTests, refetch: refetchTests } = useApiData(
    () => testSet ? testsApi.list({ testSetId: testSet.id, limit: 200 }) : Promise.reject(new Error('set no cargado')),
    [testSet?.id],
  );

  const tests = testsRes?.data ?? [];
  const criticalCount = tests.filter(t => t.priority === 'critical').length;

  if (loadingSet) return <div className="page"><LoadingBlock label="Cargando set…" /></div>;
  if (errSet || !testSet) return <div className="page"><ErrorBlock message={errSet ?? 'Set no encontrado'} onRetry={refetchSet} /></div>;

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
            <span><span className="muted">Agente:</span> <strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{testSet.agentName ?? testSet.agentId}</strong></span>
            <span>·</span>
            <span><span className="muted">ID</span> <code style={{ fontSize: 11 }}>{testSet.id}</code></span>
            {testSet.createdBy && <>
              <span>·</span>
              <span>Creado por <strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{testSet.createdBy}</strong></span>
            </>}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setEditorOpen(true)}><Icons.Edit size={14} /> Editar</button>
          <button className="btn btn-accent" onClick={() => startRun(testSet, { onCompleted: refetchTests })}>
            <Icons.PlayOutline size={14} /> Ejecutar set
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
        <div className="card stat"><div className="lbl">Tests</div><div className="val">{tests.length}</div></div>
        <div className="card stat">
          <div className="lbl">Última pass rate</div>
          <div className="val">{testSet.passRate !== undefined ? `${Math.round(testSet.passRate * 100)}%` : '—'}</div>
        </div>
        <div className="card stat"><div className="lbl">Tests críticos</div><div className="val">{criticalCount}</div></div>
        <div className="card stat">
          <div className="lbl">Última ejecución</div>
          <div className="val" style={{ fontSize: 17, fontWeight: 500 }}>{testSet.lastRun ?? '—'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Casos de prueba</h3>
          <span className="muted" style={{ fontSize: 12 }}>{tests.length} tests</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn btn-sm"><Icons.Filter size={12} /> Categoría</button>
            <button className="btn btn-sm"><Icons.Filter size={12} /> Prioridad</button>
            <button className="btn btn-sm btn-primary"
                    onClick={() => openTestEditor(null, { testSetId: testSet.id, onSaved: refetchTests })}>
              <Icons.Plus size={12} /> Nuevo test
            </button>
          </div>
        </div>

        {loadingTests && <LoadingBlock label="Cargando tests…" />}
        {errTests && !loadingTests && <ErrorBlock message={errTests} onRetry={refetchTests} />}
        {!loadingTests && !errTests && tests.length === 0 && (
          <div style={{ padding: 24 }}>
            <EmptyBlock
              title="Aún no hay casos de prueba"
              hint="Crea el primer test para empezar a evaluar este set."
              action={
                <button className="btn btn-primary"
                        onClick={() => openTestEditor(null, { testSetId: testSet.id, onSaved: () => { refetchTests(); refreshSidebar(); } })}>
                  <Icons.Plus size={14} /> Crear primer test
                </button>
              }
            />
          </div>
        )}

        {!loadingTests && !errTests && tests.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 30 }} /><th>Input</th><th>Output esperado</th>
                <th>Categoría</th><th>Prioridad</th><th>Último resultado</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.id} onClick={() => openTestEditor(t, { testSetId: testSet.id, onSaved: refetchTests })}>
                  <td>
                    <span className={`pill ${t.lastResult === 'pass' ? 'pill-green' : t.lastResult === 'fail' ? 'pill-red' : 'pill-amber'}`} style={{ padding: '1px 5px' }}>
                      {t.lastResult === 'pass' ? <Icons.Check size={10} /> : t.lastResult === 'fail' ? <Icons.X size={10} /> : <Icons.Dot size={10} />}
                    </span>
                  </td>
                  <td><div className="truncate" style={{ maxWidth: 280, fontFamily: 'Geist Mono, monospace', fontSize: 12.5 }}>{t.input}</div></td>
                  <td><div className="truncate muted" style={{ maxWidth: 320, fontFamily: 'Geist Mono, monospace', fontSize: 12.5 }}>{t.expectedOutput}</div></td>
                  <td><span className="pill">{CATEGORY_LABELS[t.category as TestCategory]}</span></td>
                  <td><span className={PRIORITY_PILL[t.priority as TestPriority]}>{PRIORITY_LABELS[t.priority as TestPriority]}</span></td>
                  <td>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {t.lastResult === 'pass' ? 'Pasó'
                        : t.lastResult === 'fail' ? 'Falló'
                        : t.lastResult === 'partial' ? 'Parcial'
                        : '—'}
                    </span>
                  </td>
                  <td><button className="icon-btn" onClick={e => e.stopPropagation()}><Icons.More size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editorOpen && (
        <TestSetEditor
          testSet={testSet}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            showToast('Set actualizado');
            refetchSet();
            refreshSidebar();
          }}
          onDeleted={() => {
            setEditorOpen(false);
            showToast('Set eliminado');
            refreshSidebar();
            navigate('/app/test-sets');
          }}
        />
      )}
    </div>
  );
}
