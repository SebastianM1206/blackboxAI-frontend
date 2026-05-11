import { useState, useEffect } from 'react';
import type { TestSet } from '../types';
import type { TestResult } from '../types';
import { Icons } from './Icons';

interface Props {
  testSet: TestSet;
  onComplete: () => void;
  onClose: () => void;
}

export function RunInProgress({ testSet, onComplete, onClose }: Props) {
  const total = testSet.testCount ?? 12;
  const passRate = testSet.passRate ?? 0.8;
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (progress >= total) {
      const t = setTimeout(() => onComplete(), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setProgress(p => p + 1);
      setResults(r => [...r, Math.random() < passRate ? 'pass' : Math.random() < 0.4 ? 'partial' : 'fail']);
    }, 90);
    return () => clearTimeout(t);
  }, [progress, total, passRate, onComplete]);

  const pass = results.filter(r => r === 'pass').length;
  const fail = results.filter(r => r === 'fail').length;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 580, background: 'var(--bg)', border: '1px solid var(--line)',
        borderRadius: 10, zIndex: 92, boxShadow: '0 24px 48px -16px rgba(22,20,15,0.25)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
          <div className="row">
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: 10 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 50,
                  background: 'var(--accent)',
                  boxShadow: '0 0 0 4px var(--accent-soft)',
                  animation: 'pulse 1.4s infinite',
                  display: 'inline-block',
                }} />
                <strong style={{ fontSize: 15 }}>Ejecutando suite</strong>
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)' }}>{testSet.name}</div>
            </div>
            <button className="icon-btn" onClick={onClose}><Icons.X size={16} /></button>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div className="row" style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>
            <span>{progress} / {total} tests</span>
            <span style={{ marginLeft: 'auto', fontFamily: 'Geist Mono, monospace' }}>
              <span style={{ color: 'var(--green)' }}>{pass} pass</span>
              {' · '}
              <span style={{ color: 'var(--red)' }}>{fail} fail</span>
            </span>
          </div>
          <div className="progress" style={{ height: 8 }}>
            <div className="progress-bar" style={{ width: `${(progress / total) * 100}%` }} />
          </div>
          <div className="heat" style={{ height: 18, marginTop: 14 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={`heat-cell ${results[i] ?? 'skipped'}`} />
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--surface-2)', borderRadius: 6, fontFamily: 'Geist Mono, monospace', fontSize: 12, color: 'var(--ink-3)' }}>
            <div>$ run --set {testSet.id} --concurrency 4</div>
            <div>→ inicializando agente {testSet.agentName ?? 'agente'}...</div>
            <div>→ enviando test #{progress} de {total}</div>
            {progress >= total && <div style={{ color: 'var(--green)' }}>✓ ejecución completada</div>}
          </div>
        </div>
      </div>
    </>
  );
}
