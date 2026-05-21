/**
 * Cliente mínimo para Firebase Identity Toolkit REST API.
 * Evita la dependencia del SDK web completo; el backend espera un ID token
 * JWT que se envía como `Authorization: Bearer <token>`.
 *
 * Docs: https://firebase.google.com/docs/reference/rest/auth
 */

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;

const IDP_BASE   = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_BASE = 'https://securetoken.googleapis.com/v1';

export interface FirebaseAuthUser {
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  refreshToken: string;
  /** unix seconds en que vence el idToken */
  expiresAt: number;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(API_KEY && AUTH_DOMAIN && PROJECT_ID);
}

function assertConfigured(): string {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Falta configurar Firebase en el .env (VITE_FIREBASE_API_KEY, ' +
      'VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID). ' +
      'Cópialas desde Firebase Console → Project settings → tu app web.',
    );
  }
  return API_KEY;
}

async function call<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = (data?.error?.message as string | undefined) ?? `HTTP_${res.status}`;
    throw new Error(humanize(code));
  }
  return data as T;
}

function humanize(code: string): string {
  const map: Record<string, string> = {
    EMAIL_EXISTS:               'Ese correo ya está registrado.',
    EMAIL_NOT_FOUND:            'No existe una cuenta con ese correo.',
    INVALID_PASSWORD:           'Contraseña incorrecta.',
    INVALID_LOGIN_CREDENTIALS:  'Correo o contraseña incorrectos.',
    USER_DISABLED:              'Esta cuenta está deshabilitada.',
    OPERATION_NOT_ALLOWED:      'El proveedor email/password no está habilitado en Firebase.',
    TOO_MANY_ATTEMPTS_TRY_LATER:'Demasiados intentos. Intenta de nuevo en unos minutos.',
    WEAK_PASSWORD:              'Contraseña débil (mínimo 6 caracteres).',
    MISSING_PASSWORD:           'Ingresa tu contraseña.',
    INVALID_EMAIL:              'El correo no es válido.',
  };
  for (const k of Object.keys(map)) {
    if (code.startsWith(k)) return map[k];
  }
  return code;
}

interface SignInResp {
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

function toUser(r: SignInResp): FirebaseAuthUser {
  return {
    localId: r.localId,
    email: r.email,
    displayName: r.displayName,
    idToken: r.idToken,
    refreshToken: r.refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + Number(r.expiresIn),
  };
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseAuthUser> {
  const key = assertConfigured();
  const data = await call<SignInResp>(
    `${IDP_BASE}/accounts:signInWithPassword?key=${key}`,
    { email, password, returnSecureToken: true },
  );
  return toUser(data);
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<FirebaseAuthUser> {
  const key = assertConfigured();
  const data = await call<SignInResp>(
    `${IDP_BASE}/accounts:signUp?key=${key}`,
    { email, password, returnSecureToken: true },
  );
  if (displayName) {
    await call(`${IDP_BASE}/accounts:update?key=${key}`, {
      idToken: data.idToken,
      displayName,
      returnSecureToken: false,
    });
    data.displayName = displayName;
  }
  return toUser(data);
}

interface RefreshResp {
  id_token: string;
  refresh_token: string;
  expires_in: string;
  user_id: string;
}

export async function refreshIdToken(refreshToken: string): Promise<{
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  localId: string;
}> {
  const key = assertConfigured();
  const res = await fetch(`${TOKEN_BASE}/token?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = (data?.error?.message as string | undefined) ?? `HTTP_${res.status}`;
    throw new Error(humanize(code));
  }
  const r = data as RefreshResp;
  return {
    idToken: r.id_token,
    refreshToken: r.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + Number(r.expires_in),
    localId: r.user_id,
  };
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const key = assertConfigured();
  await call(`${IDP_BASE}/accounts:sendOobCode?key=${key}`, {
    requestType: 'PASSWORD_RESET',
    email,
  });
}
