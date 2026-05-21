import { useState } from 'react';
import type { User, UserRole } from '../types';
import { Icons } from './Icons';
import { usersApi } from '../services/api';
import { ROLE_LABELS } from '../data/constants';

const ROLES: UserRole[] = ['admin', 'tester', 'viewer'];

interface Props {
  user: User | null;
  onClose: () => void;
  onSaved?: (user: User) => void;
  onDeleted?: (id: string) => void;
}

export function UserEditor({ user, onClose, onSaved, onDeleted }: Props) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'tester');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      if (!email.trim()) throw new Error('Email requerido.');
      const payload: Partial<User> = {
        name: name.trim() || undefined,
        email: email.trim(),
        role,
      };
      if (user) {
        const r = await usersApi.update(user.id, payload);
        onSaved?.(r.data);
      } else {
        const r = await usersApi.create(payload);
        onSaved?.(r.data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (!confirm(`Eliminar el usuario "${user.email}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      await usersApi.delete(user.id);
      onDeleted?.(user.id);
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
            <div style={{ fontSize: 16, fontWeight: 600 }}>{user ? 'Editar usuario' : 'Invitar usuario'}</div>
            {user && <div className="mono-id">{user.id}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icons.X size={16} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <div className="stack" style={{ gap: 16 }}>
            <div className="field">
              <label>Nombre</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del usuario" />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.com" />
            </div>
            <div className="field">
              <label>Rol</label>
              <select className="select" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                {ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
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
          {user && (
            <button className="btn btn-ghost" disabled={saving} onClick={handleDelete} style={{ color: 'var(--red)' }}>
              <Icons.Trash size={14} /> Eliminar
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn" disabled={saving} onClick={onClose}>Cancelar</button>
          <button className="btn btn-accent" disabled={saving} onClick={handleSave}>
            <Icons.Check size={14} /> {saving ? 'Guardando…' : user ? 'Guardar' : 'Invitar'}
          </button>
        </div>
      </div>
    </>
  );
}
