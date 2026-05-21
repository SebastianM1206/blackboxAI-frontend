export type UserRole = 'admin' | 'tester' | 'viewer';
export type AgentStatus = 'active' | 'inactive' | 'deprecated';
export type TestCategory =
  | 'greeting' | 'faq' | 'error_handling'
  | 'intent_recognition' | 'context_retention' | 'edge_case';
export type TestPriority = 'low' | 'medium' | 'high' | 'critical';
export type MetricType = 'accuracy' | 'latency' | 'coherence' | 'relevance' | 'toxicity' | 'custom';
export type MetricUnit = 'ratio' | 'percentage' | 'ms' | 'score' | 'count';
export type TestResult = 'pass' | 'fail' | 'partial' | 'skipped';
export type RunStatus = 'completed' | 'running' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  uid?: string;            // Firebase UID si el backend lo guarda
  createdAt?: string;
  updatedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  endpointUrl: string;     // requerido por el backend
  apiKey?: string;         // requerido al crear; el backend no lo devuelve por seguridad
  provider: string;
  model: string;
  version: string;
  status: AgentStatus;
  createdAt?: string;
  updatedAt?: string;

  // Campos derivados / opcionales calculados en el front
  testSets?: number;
  lastRun?: string;
  passRate?: number;
}

export interface TestSet {
  id: string;
  name: string;
  description?: string;
  agentId: string;
  agentName?: string;
  testIds?: string[];
  createdBy?: string;
  testCount?: number;
  lastRun?: string;
  passRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Test {
  id: string;
  input: string;
  expectedOutput: string;
  category: TestCategory;
  priority: TestPriority;
  testSetId: string;
  lastResult?: TestResult;
  createdAt?: string;
  updatedAt?: string;
}

export interface Metric {
  id: string;
  name: string;
  description?: string;
  type: MetricType;
  value: number;
  unit: MetricUnit;
  usage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Run {
  id: string;
  testSetId?: string;
  testSet: string;          // nombre del set
  agentId?: string;
  agent: string;            // nombre del agente
  agentVersion: string;
  started: string;
  duration: string;
  status: RunStatus;
  pass: number;
  fail: number;
  total: number;
  passRate: number;
  triggeredBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}
