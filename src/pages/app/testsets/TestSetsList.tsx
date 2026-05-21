<<<<<<< HEAD
import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { Pct } from '../../../components/Pct';
import { HeatMap } from '../../../components/HeatMap';
import { useApiData } from '../../../hooks/useApiData';
import { testSetsApi, agentsApi } from '../../../services/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../../../components/States';
import { TestSetEditor } from '../../../components/TestSetEditor';
import { useApp } from '../AppLayout';
=======
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../../components/Icons';
import { Pct } from '../../../components/Pct';
import { HeatMap } from '../../../components/HeatMap';
import { testSetsApi } from '../../../services/api';
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
import type { TestSet } from '../../../types';

export default function TestSetsList() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { agentId?: string } };
  const { showToast, refreshSidebar } = useApp();
  const [editor, setEditor] = useState<{ open: boolean; testSet: TestSet | null }>({ open: false, testSet: null });

  const agentIdFilter = location.state?.agentId;

  const { data: setsRes, loading, error, refetch } = useApiData(
    () => testSetsApi.list({ agentId: agentIdFilter, limit: 100 }),
    [agentIdFilter],
  );

  // Para mostrar nombre de agente en la tabla
  const { data: agentsRes } = useApiData(
    () => agentsApi.list({ limit: 200 }),
    [],
  );

  const agentsById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of (agentsRes?.data ?? [])) m.set(a.id, a.name);
    return m;
  }, [agentsRes]);

  const sets = setsRes?.data ?? [];

  function onSaved(saved: TestSet) {
    showToast(editor.testSet ? 'Set actualizado' : 'Set creado');
    setEditor({ open: false, testSet: null });
    refetch();
    refreshSidebar();
    if (!editor.testSet) navigate(`/app/test-sets/${saved.id}`);
  }

  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  async function loadTestSets() {
    try {
      setLoading(true);
      setError(null);

      const response = await testSetsApi.list({
        page: 1,
        limit: 100,
      });

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setTestSets(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar los sets de prueba'
      );
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  async function handleNewSet() {
    try {
      const timestamp = Date.now();

      await testSetsApi.create({
        name: `Set ${timestamp}`,
        description: 'Set de prueba creado desde el frontend',
      });

      await loadTestSets();
      alert('Set de prueba creado correctamente');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el set de prueba'
      );
    }
  }

  // Carga inicial sin useEffect
  if (!initialized && !loading) {
    void loadTestSets();
  }

  if (loading && !initialized) {
    return (
      <div className="page">
        <p>Cargando sets de prueba...</p>
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
            void loadTestSets();
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Sets de Prueba</h1>
          <p className="page-sub">
            Conjuntos de casos de prueba agrupados por agente o por escenario.
          </p>
        </div>

        <div className="page-actions">
<<<<<<< HEAD
          <button className="btn"><Icons.Filter size={14} /> Filtros</button>
          <button className="btn btn-primary" onClick={() => setEditor({ open: true, testSet: null })}>
=======
          <button className="btn">
            <Icons.Filter size={14} /> Filtros
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              void handleNewSet();
            }}
          >
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
            <Icons.Plus size={14} /> Nuevo set
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {loading && <LoadingBlock label="Cargando sets…" />}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && sets.length === 0 && (
        <EmptyBlock
          title="No hay sets de prueba"
          hint="Crea tu primer set para agrupar casos de prueba contra un agente."
          action={
            <button className="btn btn-primary" onClick={() => setEditor({ open: true, testSet: null })}>
              <Icons.Plus size={14} /> Crear primer set
            </button>
          }
        />
      )}

      {!loading && !error && sets.length > 0 && (
=======
      {testSets.length === 0 ? (
        <div className="card">
          <div className="card-body">
            No hay sets de prueba registrados.
          </div>
        </div>
      ) : (
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
        <div className="card">
          <table className="table">
            <thead>
              <tr>
<<<<<<< HEAD
                <th>Set</th><th>Agente</th><th>Tests</th><th>Distribución</th>
                <th>Pass rate</th><th>Última ejec.</th><th>Creador</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {sets.map(s => {
                const agentName = s.agentName ?? agentsById.get(s.agentId) ?? '—';
                return (
                  <tr key={s.id} onClick={() => navigate(`/app/test-sets/${s.id}`, { state: { testSet: s } })}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{s.description}</div>
                    </td>
                    <td>{agentName}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{s.testCount ?? '—'}</td>
                    <td style={{ width: 180 }}>
                      {s.passRate !== undefined && s.testCount !== undefined ? (
                        <HeatMap
                          total={Math.min(s.testCount, 24)}
                          passRate={s.passRate}
                          fails={Math.round(Math.min(s.testCount, 24) * (1 - s.passRate))}
                          height={14}
                        />
                      ) : (
                        <span className="muted" style={{ fontSize: 11 }}>sin ejecuciones</span>
                      )}
                    </td>
                    <td>{s.passRate !== undefined ? <Pct value={s.passRate} /> : <span className="muted">—</span>}</td>
                    <td className="muted">{s.lastRun ?? '—'}</td>
                    <td>{s.createdBy ?? '—'}</td>
                    <td>
                      <button className="icon-btn" onClick={e => { e.stopPropagation(); setEditor({ open: true, testSet: s }); }}>
                        <Icons.More size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
=======
                <th>Set</th>
                <th>Agente</th>
                <th>Tests</th>
                <th>Distribución</th>
                <th>Pass rate</th>
                <th>Última ejec.</th>
                <th>Creador</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>

            <tbody>
              {testSets.map((s) => (
                <tr
                  key={s.id}
                  onClick={() =>
                    navigate(`/app/test-sets/${s.id}`, {
                      state: { testSet: s },
                    })
                  }
                >
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {s.name}
                    </div>
                    <div
                      className="muted"
                      style={{ fontSize: 12 }}
                    >
                      {s.description}
                    </div>
                  </td>

                  <td>{s.agentName ?? '-'}</td>

                  <td
                    className="mono"
                    style={{ fontSize: 12 }}
                  >
                    {s.testCount ?? 0}
                  </td>

                  <td style={{ width: 180 }}>
                    <HeatMap
                      total={Math.min(s.testCount ?? 24, 24)}
                      passRate={s.passRate ?? 0.8}
                      fails={Math.round(
                        Math.min(s.testCount ?? 24, 24) *
                          (1 - (s.passRate ?? 0.8))
                      )}
                      height={14}
                    />
                  </td>

                  <td>
                    <Pct value={s.passRate ?? 0} />
                  </td>

                  <td className="muted">
                    {s.lastRun ?? '-'}
                  </td>

                  <td>{s.createdBy ?? '-'}</td>

                  <td>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Icons.More size={14} />
                    </button>
                  </td>
                </tr>
              ))}
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
            </tbody>
          </table>
        </div>
      )}
<<<<<<< HEAD

      {editor.open && (
        <TestSetEditor
          testSet={editor.testSet}
          defaultAgentId={agentIdFilter}
          onClose={() => setEditor({ open: false, testSet: null })}
          onSaved={onSaved}
          onDeleted={() => {
            setEditor({ open: false, testSet: null });
            showToast('Set eliminado');
            refetch();
            refreshSidebar();
          }}
        />
      )}
=======
>>>>>>> cbc8b4e83cad6d9316614405cf7b263628e08f32
    </div>
  );
}