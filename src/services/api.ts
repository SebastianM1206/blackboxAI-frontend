import type {
  Agent, User, TestSet, Test, Metric, Run,
  PaginatedResponse, ApiResponse,
} from '../types';
import { ApiError } from '../types';
import { getCurrentToken } from '../contexts/AuthContext';
import { mockApi, isMockEnabled, setMockEnabled } from '../data/mockData';

const RAW_BASE = (import.meta.env.VITE_API_URL ?? 'https://backendpi2-1201.onrender.com/api/v1') as string;
const API_BASE = RAW_BASE.replace(/\/+$/, '');

const AUTO_MOCKS = String(import.meta.env.VITE_AUTO_MOCKS ?? 'true').toLowerCase() !== 'false';
const FORCE_MOCKS = String(import.meta.env.VITE_USE_MOCKS ?? '').toLowerCase() === 'true';

export const apiBase = API_BASE;

interface ReqOptions extends RequestInit {
  /** si true (default), envía Authorization si hay token */
  auth?: boolean;
}

function useMocks(): boolean {
  return FORCE_MOCKS || isMockEnabled();
}

function shouldFallback(err: unknown, fallbackOn404: boolean): boolean {
  if (!AUTO_MOCKS) return false;
  if (err instanceof ApiError) {
    if (err.status === 404) return fallbackOn404;
    if (err.status === 401 || err.status === 403) return true;
    if (err.status >= 500) return true;
    return false;
  }
  return true;
}

async function withMockFallback<T>(
  realCall: () => Promise<T>,
  mockCall: () => Promise<T>,
  opts: { fallbackOn404?: boolean } = {},
): Promise<T> {
  if (useMocks()) return mockCall();
  try {
    return await realCall();
  } catch (err) {
    if (shouldFallback(err, Boolean(opts.fallbackOn404))) {
      setMockEnabled(true);
      return mockCall();
    }
    throw err;
  }
}

async function req<T>(path: string, init: ReqOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = init;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = await getCurrentToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let payload: unknown = undefined;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }

  if (!res.ok) {
    const message = extractMessage(payload) ?? `HTTP ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}

function extractMessage(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    const o = payload as Record<string, unknown>;
    if (typeof o.message === 'string') return o.message;
    if (typeof o.error   === 'string') return o.error;
    if (o.errors && typeof o.errors === 'object') {
      const arr = Array.isArray(o.errors) ? o.errors : Object.values(o.errors);
      const first = arr[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && 'message' in first) {
        return String((first as { message: unknown }).message);
      }
    }
  }
  return null;
}

function qs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return '';
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

/* ─────────────────────────── Users ─────────────────────────── */
export const usersApi = {
  list: (p?: { page?: number; limit?: number; role?: string; q?: string }) =>
    withMockFallback(
      () => req<PaginatedResponse<User>>(`/users${qs(p)}`),
      () => mockApi.users.list(p),
      { fallbackOn404: true },
    ),
  get:    (id: string) =>
    withMockFallback(
      () => req<ApiResponse<User>>(`/users/${id}`),
      () => mockApi.users.get(id),
    ),
  create: (data: Partial<User> & { password?: string }) =>
    withMockFallback(
      () => req<ApiResponse<User>>('/users', { method: 'POST', body: JSON.stringify(data) }),
      () => mockApi.users.create(data),
      { fallbackOn404: true },
    ),
  update: (id: string, data: Partial<User>) =>
    withMockFallback(
      () => req<ApiResponse<User>>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => mockApi.users.update(id, data),
      { fallbackOn404: true },
    ),
  delete: (id: string) =>
    withMockFallback(
      () => req<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
      () => mockApi.users.delete(id),
      { fallbackOn404: true },
    ),
};

/* ─────────────────────────── Agents ─────────────────────────── */
export const agentsApi = {
  list: (p?: { page?: number; limit?: number; status?: string; provider?: string; q?: string }) =>
    withMockFallback(
      () => req<PaginatedResponse<Agent>>(`/agents${qs(p)}`),
      () => mockApi.agents.list(p),
      { fallbackOn404: true },
    ),
  get:    (id: string) =>
    withMockFallback(
      () => req<ApiResponse<Agent>>(`/agents/${id}`),
      () => mockApi.agents.get(id),
    ),
  create: (data: Partial<Agent>) =>
    withMockFallback(
      () => req<ApiResponse<Agent>>('/agents', { method: 'POST', body: JSON.stringify(data) }),
      () => mockApi.agents.create(data),
      { fallbackOn404: true },
    ),
  update: (id: string, data: Partial<Agent>) =>
    withMockFallback(
      () => req<ApiResponse<Agent>>(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => mockApi.agents.update(id, data),
      { fallbackOn404: true },
    ),
  delete: (id: string) =>
    withMockFallback(
      () => req<{ message: string }>(`/agents/${id}`, { method: 'DELETE' }),
      () => mockApi.agents.delete(id),
      { fallbackOn404: true },
    ),
};

/* ──────────────────────── Test Sets ──────────────────────── */
export const testSetsApi = {
  list: (p?: { page?: number; limit?: number; agentId?: string; createdBy?: string; q?: string }) =>
    withMockFallback(
      () => req<PaginatedResponse<TestSet>>(`/test-sets${qs(p)}`),
      () => mockApi.testSets.list(p),
      { fallbackOn404: true },
    ),
  get:    (id: string) =>
    withMockFallback(
      () => req<ApiResponse<TestSet>>(`/test-sets/${id}`),
      () => mockApi.testSets.get(id),
    ),
  create: (data: Partial<TestSet>) =>
    withMockFallback(
      () => req<ApiResponse<TestSet>>('/test-sets', { method: 'POST', body: JSON.stringify(data) }),
      () => mockApi.testSets.create(data),
      { fallbackOn404: true },
    ),
  update: (id: string, data: Partial<TestSet>) =>
    withMockFallback(
      () => req<ApiResponse<TestSet>>(`/test-sets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => mockApi.testSets.update(id, data),
      { fallbackOn404: true },
    ),
  delete: (id: string) =>
    withMockFallback(
      () => req<{ message: string }>(`/test-sets/${id}`, { method: 'DELETE' }),
      () => mockApi.testSets.delete(id),
      { fallbackOn404: true },
    ),
};

/* ─────────────────────────── Tests ─────────────────────────── */
export const testsApi = {
  list: (p?: { page?: number; limit?: number; testSetId?: string; category?: string; priority?: string }) =>
    withMockFallback(
      () => req<PaginatedResponse<Test>>(`/tests${qs(p)}`),
      () => mockApi.tests.list(p),
      { fallbackOn404: true },
    ),
  get:    (id: string) =>
    withMockFallback(
      () => req<ApiResponse<Test>>(`/tests/${id}`),
      () => mockApi.tests.get(id),
    ),
  create: (data: Partial<Test>) =>
    withMockFallback(
      () => req<ApiResponse<Test>>('/tests', { method: 'POST', body: JSON.stringify(data) }),
      () => mockApi.tests.create(data),
      { fallbackOn404: true },
    ),
  update: (id: string, data: Partial<Test>) =>
    withMockFallback(
      () => req<ApiResponse<Test>>(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => mockApi.tests.update(id, data),
      { fallbackOn404: true },
    ),
  delete: (id: string) =>
    withMockFallback(
      () => req<{ message: string }>(`/tests/${id}`, { method: 'DELETE' }),
      () => mockApi.tests.delete(id),
      { fallbackOn404: true },
    ),
};

/* ─────────────────────────── Metrics ─────────────────────────── */
export const metricsApi = {
  list: (p?: { page?: number; limit?: number; type?: string }) =>
    withMockFallback(
      () => req<PaginatedResponse<Metric>>(`/metrics${qs(p)}`),
      () => mockApi.metrics.list(p),
      { fallbackOn404: true },
    ),
  get:    (id: string) =>
    withMockFallback(
      () => req<ApiResponse<Metric>>(`/metrics/${id}`),
      () => mockApi.metrics.get(id),
    ),
  create: (data: Partial<Metric>) =>
    withMockFallback(
      () => req<ApiResponse<Metric>>('/metrics', { method: 'POST', body: JSON.stringify(data) }),
      () => mockApi.metrics.create(data),
      { fallbackOn404: true },
    ),
  update: (id: string, data: Partial<Metric>) =>
    withMockFallback(
      () => req<ApiResponse<Metric>>(`/metrics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => mockApi.metrics.update(id, data),
      { fallbackOn404: true },
    ),
  delete: (id: string) =>
    withMockFallback(
      () => req<{ message: string }>(`/metrics/${id}`, { method: 'DELETE' }),
      () => mockApi.metrics.delete(id),
      { fallbackOn404: true },
    ),
};

/* ─────────────────────────── Runs ───────────────────────────
 * El backend puede exponer este recurso en /runs o /test-runs según versión.
 * Probamos /runs primero y caemos a /test-runs si el primero responde 404.
 */
let runsPath: '/runs' | '/test-runs' | null = null;
async function runsBase(): Promise<'/runs' | '/test-runs'> {
  if (runsPath) return runsPath;
  try {
    await req(`/runs?limit=1`);
    runsPath = '/runs';
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) runsPath = '/test-runs';
    else runsPath = '/runs';
  }
  return runsPath;
}

export const runsApi = {
  list: async (p?: { page?: number; limit?: number; agentId?: string; testSetId?: string; status?: string }) =>
    withMockFallback(
      async () => {
        const base = await runsBase();
        return req<PaginatedResponse<Run>>(`${base}${qs(p)}`);
      },
      () => mockApi.runs.list(p),
      { fallbackOn404: true },
    ),
  get: async (id: string) =>
    withMockFallback(
      async () => {
        const base = await runsBase();
        return req<ApiResponse<Run>>(`${base}/${id}`);
      },
      () => mockApi.runs.get(id),
    ),
  create: async (data: Partial<Run> & { testSetId: string }) =>
    withMockFallback(
      async () => {
        const base = await runsBase();
        return req<ApiResponse<Run>>(base, { method: 'POST', body: JSON.stringify(data) });
      },
      () => mockApi.runs.create(data),
      { fallbackOn404: true },
    ),
};

/* ─────────────────────────── Auth (servidor) ───────────────────────────
 * Algunos backends Firebase-Admin requieren una llamada de sync tras el
 * primer login (para crear el documento User a partir del Firebase UID).
 * Si tu backend no la tiene, simplemente devuelve 404 y se ignora.
 */
export const authApi = {
  syncUser: async (data: { name?: string; email: string }): Promise<User | null> => {
    try {
      const r = await withMockFallback(
        () => req<ApiResponse<User>>('/auth/sync', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
        () => mockApi.auth.syncUser(data).then(user => ({ message: 'ok', data: user! })),
        { fallbackOn404: true },
      );
      return r.data;
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 405)) return null;
      throw e;
    }
  },
  me: async (): Promise<User | null> => {
    try {
      const r = await withMockFallback(
        () => req<ApiResponse<User>>('/auth/me'),
        async () => {
          const user = await mockApi.auth.me();
          if (!user) throw new ApiError('No autorizado', 401);
          return { message: 'ok', data: user } as ApiResponse<User>;
        },
        { fallbackOn404: true },
      );
      return r.data;
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 401)) return null;
      throw e;
    }
  },
};

/* ─────────────────────────── Healthcheck ─────────────────────────── */
export const systemApi = {
  ping: () =>
    withMockFallback(
      () => req<{ ok: boolean }>('/health', { auth: false }),
      () => mockApi.system.ping(),
      { fallbackOn404: true },
    ).catch(() => ({ ok: false })),
};
