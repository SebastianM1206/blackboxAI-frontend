import { useState } from 'react';
import type { Test, TestCategory, TestPriority } from '../types';
import { Icons } from './Icons';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../data/constants';
import { testsApi } from '../services/api';

interface Props {
  test: Test | null;
  /** requerido para crear un test nuevo */
  testSetId?: string;
  onClose: () => void;
  onSaved?: (test: Test) => void;
  onDeleted?: (id: string) => void;
}

export function TestEditor({ test, testSetId, onClose, onSaved, onDeleted }: Props) {
  const [input, setInput]                   = useState(test?.input ?? '');
  const [expectedOutput, setExpectedOutput] = useState(test?.expectedOutput ?? '');
  const [category, setCategory] = useState<TestCategory>(test?.category ?? 'faq');
  const [priority, setPriority] = useState<TestPriority>(test?.priority ?? 'medium');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (test) {
        const r = await testsApi.update(test.id, { input, expectedOutput, category, priority });
        onSaved?.(r.data);
      } else {
        if (!testSetId) throw new Error('Falta el testSetId para crear el test.');
        const r = await testsApi.create({ input, expectedOutput, category, priority, testSetId });
        onSaved?.(r.data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!test) return;
    if (!confirm('¿Eliminar este test? Esta acción no se puede deshacer.')) return;
    setSaving(true);
    setError(null);
    try {
      await testsApi.delete(test.id);
      onDeleted?.(test.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
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
                      type="button"
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

            {error && (
              <div style={{
                padding: '8px 10px', borderRadius: 6, fontSize: 12.5,
                background: 'rgba(213, 71, 71, 0.08)', color: 'var(--red)',
                border: '1px solid rgba(213, 71, 71, 0.25)',
              }}>{error}</div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {test && (
            <button className="btn btn-ghost" disabled={saving} style={{ color: 'var(--red)' }} onClick={handleDelete}>
              <Icons.Trash size={14} /> Eliminar
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn" disabled={saving} onClick={onClose}>Cancelar</button>
          <button className="btn btn-accent" disabled={saving} onClick={handleSave}>
            <Icons.Check size={14} /> {saving ? 'Guardando…' : test ? 'Guardar cambios' : 'Crear test'}
          </button>
        </div>
      </div>
    </>
  );
}
