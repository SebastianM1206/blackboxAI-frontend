import {
  createContext, useContext, useEffect, useState, useCallback, useMemo, useRef,
  type ReactNode,
} from 'react';
import {
  signInWithEmail, signUpWithEmail, refreshIdToken,
  isFirebaseConfigured, type FirebaseAuthUser,
} from '../lib/firebaseAuth';
import { setMockEnabled, upsertMockUser } from '../data/mockData';

const STORAGE_KEY = 'bb.session.v1';

interface StoredSession {
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthState {
  user: StoredSession | null;
  loading: boolean;
  firebaseConfigured: boolean;
  signIn:  (email: string, password: string) => Promise<void>;
  signUp:  (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
  /** Devuelve un ID token vigente, refrescándolo si está por vencer. */
  getToken: () => Promise<string | null>;
}

const Ctx = createContext<AuthState | null>(null);

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function saveSession(s: StoredSession | null): void {
  if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  else   localStorage.removeItem(STORAGE_KEY);
}

function fromAuthUser(u: FirebaseAuthUser): StoredSession {
  return { ...u };
}

function createLocalSession(email: string, name?: string): StoredSession {
  const now = Math.floor(Date.now() / 1000);
  const base = Math.abs(hashCode(email)).toString(36).slice(0, 6);
  return {
    localId: `local_${base}`,
    email,
    displayName: name || email.split('@')[0],
    idToken: `local.${base}.${now}`,
    refreshToken: `local.${base}.refresh`,
    expiresAt: now + 60 * 60 * 24 * 30,
  };
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredSession | null>(() => loadSession());
  const [loading, setLoading] = useState(false);
  const refreshing = useRef<Promise<string | null> | null>(null);

  // Persistencia
  useEffect(() => { saveSession(user); }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        const local = createLocalSession(email);
        setMockEnabled(true);
        setUser(local);
        upsertMockUser({ email: local.email, name: local.displayName, uid: local.localId, role: 'admin' });
        return;
      }
      const u = await signInWithEmail(email, password);
      setUser(fromAuthUser(u));
    } finally { setLoading(false); }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        const local = createLocalSession(email, name);
        setMockEnabled(true);
        setUser(local);
        upsertMockUser({ email: local.email, name: local.displayName, uid: local.localId, role: 'admin' });
        return;
      }
      const u = await signUpWithEmail(email, password, name);
      setUser(fromAuthUser(u));
    } finally { setLoading(false); }
  }, []);

  const signOut = useCallback(() => { setUser(null); }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    const current = loadSession();
    if (!current) return null;
    if (!isFirebaseConfigured()) return current.idToken;
    const now = Math.floor(Date.now() / 1000);
    // si vence en menos de 60s, refresca
    if (current.expiresAt - now > 60) return current.idToken;
    if (refreshing.current) return refreshing.current;
    refreshing.current = (async () => {
      try {
        const r = await refreshIdToken(current.refreshToken);
        const next: StoredSession = { ...current, ...r };
        setUser(next);
        return next.idToken;
      } catch {
        setUser(null);
        return null;
      } finally {
        refreshing.current = null;
      }
    })();
    return refreshing.current;
  }, []);

  const value = useMemo<AuthState>(() => ({
    user, loading,
    firebaseConfigured: isFirebaseConfigured(),
    signIn, signUp, signOut, getToken,
  }), [user, loading, signIn, signUp, signOut, getToken]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth fuera de <AuthProvider>');
  return v;
}

/** Permite al api.ts obtener el token sin estar dentro de un componente React. */
let externalTokenGetter: () => Promise<string | null> = async () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return (JSON.parse(raw) as StoredSession).idToken; } catch { return null; }
};

// eslint-disable-next-line react-refresh/only-export-components
export function registerTokenGetter(fn: () => Promise<string | null>): void {
  externalTokenGetter = fn;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getCurrentToken(): Promise<string | null> {
  return externalTokenGetter();
}
