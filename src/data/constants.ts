import type { TestCategory, TestPriority, AgentStatus, UserRole, MetricType } from '../types';

export const CATEGORY_LABELS: Record<TestCategory, string> = {
  greeting: 'Saludo',
  faq: 'FAQ',
  error_handling: 'Manejo de errores',
  intent_recognition: 'Reconocimiento de intención',
  context_retention: 'Retención de contexto',
  edge_case: 'Caso límite',
};

export const PRIORITY_LABELS: Record<TestPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

export const PRIORITY_PILL: Record<TestPriority, string> = {
  low: 'pill',
  medium: 'pill pill-blue',
  high: 'pill pill-amber',
  critical: 'pill pill-red',
};

export const STATUS_PILL: Record<AgentStatus, string> = {
  active: 'pill pill-green',
  inactive: 'pill',
  deprecated: 'pill pill-amber',
};

export const STATUS_LABELS: Record<AgentStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  deprecated: 'Deprecado',
};

export const ROLE_PILL: Record<UserRole, string> = {
  admin: 'pill pill-violet',
  tester: 'pill pill-blue',
  viewer: 'pill',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'admin',
  tester: 'tester',
  viewer: 'viewer',
};

export const PROVIDER_GLYPH: Record<string, string> = {
  OpenAI: '◐',
  Anthropic: '✦',
  Google: '◇',
  Mistral: '◈',
  Cohere: '◉',
};

export const PROVIDER_COLOR: Record<string, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d97757',
  Google: '#4285f4',
  Mistral: '#ff7000',
  Cohere: '#39594d',
};

export const METRIC_TYPE_PILL: Record<MetricType, string> = {
  accuracy: 'pill-green',
  latency: 'pill-blue',
  coherence: 'pill-violet',
  relevance: 'pill-blue',
  toxicity: 'pill-red',
  custom: '',
};
