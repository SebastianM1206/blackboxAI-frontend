import type { Agent, User, TestSet, Test, Metric, PaginatedResponse, ApiResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const usersApi = {
  list: (p?: { page?: number; limit?: number; role?: string }) =>
    req<PaginatedResponse<User>>(`/users${qs(p)}`),
  get:    (id: string)        => req<ApiResponse<User>>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) =>
    req<ApiResponse<User>>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<User>) =>
    req<ApiResponse<User>>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string)        => req<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
};

export const agentsApi = {
  list: (p?: { page?: number; limit?: number; status?: string; provider?: string }) =>
    req<PaginatedResponse<Agent>>(`/agents${qs(p)}`),
  get:    (id: string)          => req<ApiResponse<Agent>>(`/agents/${id}`),
  create: (data: Partial<Agent>) =>
    req<ApiResponse<Agent>>('/agents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Agent>) =>
    req<ApiResponse<Agent>>(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string)           => req<{ message: string }>(`/agents/${id}`, { method: 'DELETE' }),
};

export const testSetsApi = {
  list: (p?: { page?: number; limit?: number; agentId?: string; createdBy?: string }) =>
    req<PaginatedResponse<TestSet>>(`/test-sets${qs(p)}`),
  get:    (id: string)             => req<ApiResponse<TestSet>>(`/test-sets/${id}`),
  create: (data: Partial<TestSet>) =>
    req<ApiResponse<TestSet>>('/test-sets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<TestSet>) =>
    req<ApiResponse<TestSet>>(`/test-sets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string)              => req<{ message: string }>(`/test-sets/${id}`, { method: 'DELETE' }),
};

export const testsApi = {
  list: (p?: { page?: number; limit?: number; testSetId?: string; category?: string; priority?: string }) =>
    req<PaginatedResponse<Test>>(`/tests${qs(p)}`),
  get:    (id: string)           => req<ApiResponse<Test>>(`/tests/${id}`),
  create: (data: Partial<Test>)  =>
    req<ApiResponse<Test>>('/tests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Test>) =>
    req<ApiResponse<Test>>(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string)            => req<{ message: string }>(`/tests/${id}`, { method: 'DELETE' }),
};

export const metricsApi = {
  list: (p?: { page?: number; limit?: number; type?: string }) =>
    req<PaginatedResponse<Metric>>(`/metrics${qs(p)}`),
  get:    (id: string)             => req<ApiResponse<Metric>>(`/metrics/${id}`),
  create: (data: Partial<Metric>)  =>
    req<ApiResponse<Metric>>('/metrics', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Metric>) =>
    req<ApiResponse<Metric>>(`/metrics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string)              => req<{ message: string }>(`/metrics/${id}`, { method: 'DELETE' }),
};
