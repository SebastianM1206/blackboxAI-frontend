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
  createdAt: string;
  updatedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  provider: string;
  model: string;
  version: string;
  status: AgentStatus;
  createdAt?: string;
  updatedAt?: string;
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
  testSet: string;
  agent: string;
  agentVersion: string;
  started: string;
  duration: string;
  status: RunStatus;
  pass: number;
  fail: number;
  total: number;
  passRate: number;
  triggeredBy: string;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
