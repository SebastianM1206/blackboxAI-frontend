import { useState } from 'react';
import type { Test } from '../types';
import { Icons } from './Icons';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../data/constants';
import type { TestCategory, TestPriority } from '../types';

interface Props {
  test: Test | null;
  onClose: () => void;
  onSave?: () => void;
}

export function TestEditor({ test, onClose, onSave }: Props) {
  const [input, setInput] = useState(test?.input ?? '');
  const [expectedOutput, setExpectedOutput] = useState(test?.expectedOutput ?? '');
  const [category, setCategory] = useState<TestCategory>(test?.category ?? 'faq');
  const [priority, setPriority] = useState<TestPriority>(test?.priority ?? 'medium');

  function handleSave() {
    onSave?.();
    onClose();
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{test ? 'Editar caso de prueba' : 'Nuevo caso de prueba'}</div>
            {test && <div className="mono-id">{test.id}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icons.X size={16} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <div className="stack" style={{ gap: 18 }}>
            <div className="field">
              <label>Input — mensaje del usuario</label>
              <textarea
                className="textarea"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="¿Cuáles son sus horarios de atención?"
                style={{ minHeight: 90 }}
              />
              <span className="hint">El texto exacto que se enviará al agente bajo prueba.</span>
            </div>

            <div className="field">
              <label>Output esperado — respuesta correcta de referencia</label>
              <textarea
                className="textarea"
                value={expectedOutput}
                onChange={e => setExpectedOutput(e.target.value)}
                placeholder="Nuestro horario de atención es de lunes a viernes..."
                style={{ minHeight: 120 }}
              />
              <span className="hint">Se compara contra la respuesta real usando las métricas configuradas en el set.</span>
            </div>

            <div className="row" style={{ gap: 16, alignItems: 'flex-start' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Categoría</label>
                <select className="select" value={category} onChange={e => setCategory(e.target.value as TestCategory)}>
                  {(Object.entries(CATEGORY_LABELS) as [TestCategory, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Prioridad</label>
                <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {(Object.entries(PRIORITY_LABELS) as [TestPriority, string][]).map(([k, v]) => (
                    <button
                      key={k}
                      className={`btn btn-sm ${priority === k ? '' : 'btn-ghost'}`}
                      onClick={() => setPriority(k)}
                      style={priority === k ? { borderColor: 'var(--accent)', color: 'var(--accent-ink)', background: 'var(--accent-soft)' } : {}}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="field">
              <label>Tags <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></label>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <span className="pill pill-blue"><Icons.Tag size={10} /> facturación</span>
                <span className="pill pill-blue"><Icons.Tag size={10} /> regresión</span>
                <button className="btn btn-sm btn-ghost"><Icons.Plus size={12} /> Añadir</button>
              </div>
            </div>

            {test && (
              <div className="card" style={{ background: 'var(--surface-2)' }}>
                <div className="card-head">
                  <h3 className="card-title">Último resultado</h3>
                  <span className="muted" style={{ fontSize: 12 }}>hace 2h · run_8c28</span>
                  <span className={`pill ${test.lastResult === 'pass' ? 'pill-green' : test.lastResult === 'fail' ? 'pill-red' : 'pill-amber'}`} style={{ marginLeft: 'auto' }}>
                    {test.lastResult === 'pass' ? 'Pasó' : test.lastResult === 'fail' ? 'Falló' : 'Parcial'}
                  </span>
                </div>
                <div className="card-body" style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12.5, lineHeight: 1.6 }}>
                  <div className="muted">Respuesta real del agente:</div>
                  <div style={{ padding: 12, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 6, marginTop: 6 }}>
                    {test.lastResult === 'pass' ? test.expectedOutput : 'Lo siento, no estoy seguro de cómo responder a eso. ¿Podrías darme más contexto?'}
                  </div>
                  <div className="row" style={{ marginTop: 10, gap: 14 }}>
                    <span>Exactitud: <strong style={{ color: 'var(--ink)' }}>{test.lastResult === 'pass' ? '0.94' : '0.31'}</strong></span>
                    <span>Relevancia: <strong style={{ color: 'var(--ink)' }}>{test.lastResult === 'pass' ? '0.91' : '0.42'}</strong></span>
                    <span>Latencia: <strong style={{ color: 'var(--ink)' }}>1,142ms</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {test && <button className="btn btn-ghost" style={{ color: 'var(--red)' }}><Icons.Trash size={14} /> Eliminar</button>}
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-accent" onClick={handleSave}>
            <Icons.Check size={14} /> {test ? 'Guardar cambios' : 'Crear test'}
          </button>
        </div>
      </div>
    </>
  );
}
