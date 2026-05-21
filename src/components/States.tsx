import type { ReactNode } from 'react';
import { Icons } from './Icons';

export function LoadingBlock({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>
      <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
        <span style={{
          width: 12, height: 12, borderRadius: '50%',
          background: 'var(--accent)', display: 'inline-block',
          boxShadow: '0 0 0 4px var(--accent-soft)', animation: 'pulse 1.4s infinite',
        }} />
        <span style={{ fontSize: 13 }}>{label}</span>
      </div>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card" style={{ padding: 24, borderColor: 'var(--red)' }}>
      <div className="row" style={{ gap: 10 }}>
        <Icons.X size={16} />
        <strong style={{ fontSize: 13 }}>No se pudo cargar</strong>
      </div>
      <div className="muted" style={{ fontSize: 12.5, marginTop: 8, fontFamily: 'Geist Mono, monospace' }}>{message}</div>
      {onRetry && (
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn btn-sm" onClick={onRetry}>
            <Icons.PlayOutline size={12} /> Reintentar
          </button>
          <span className="muted" style={{ fontSize: 11.5, marginLeft: 10 }}>
            Si el deploy de Render está dormido la primera carga puede tardar ~30s.
          </span>
        </div>
      )}
    </div>
  );
}

export function EmptyBlock({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="card" style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
      {hint && <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{hint}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
