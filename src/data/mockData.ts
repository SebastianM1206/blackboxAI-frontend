import type { User, Agent, TestSet, Test, Metric, Run } from '../types';

export const MOCK_USERS: User[] = [
  { id: '64f3a1b2c8e4d50012a3b4c5', name: 'Juan Erazo',      email: 'juan@uao.edu.co',   role: 'admin',  createdAt: '2024-01-15T10:30:00Z' },
  { id: '64f3a1b2c8e4d50012a3b4c6', name: 'María García',    email: 'maria@uao.edu.co',  role: 'tester', createdAt: '2024-02-10T14:00:00Z' },
  { id: '64f3a1b2c8e4d50012a3b4c7', name: 'Carlos López',    email: 'carlos@uao.edu.co', role: 'tester', createdAt: '2024-04-22T09:15:00Z' },
  { id: '64f3a1b2c8e4d50012a3b4c8', name: 'Ana Rodríguez',   email: 'ana@uao.edu.co',    role: 'viewer', createdAt: '2024-03-08T11:20:00Z' },
  { id: '64f3a1b2c8e4d50012a3b4c9', name: 'Diego Martínez',  email: 'diego@uao.edu.co',  role: 'tester', createdAt: '2024-03-25T16:45:00Z' },
  { id: '64f3a1b2c8e4d50012a3b4ca', name: 'Sofía Herrera',   email: 'sofia@uao.edu.co',  role: 'admin',  createdAt: '2024-01-20T08:00:00Z' },
];

export const MOCK_AGENTS: Agent[] = [
  { id: '64f3a1b2c8e4d50012a3b600', name: 'Asistente de Soporte v1', description: 'Atención al cliente, soporte técnico',            provider: 'OpenAI',    model: 'gpt-4o',             version: '1.0.0', status: 'active',     testSets: 4, lastRun: 'hace 2h',      passRate: 0.94 },
  { id: '64f3a1b2c8e4d50012a3b601', name: 'Asistente de Ventas',     description: 'Consultas comerciales y cotizaciones',            provider: 'Anthropic', model: 'claude-sonnet-4-6',  version: '1.0.0', status: 'active',     testSets: 3, lastRun: 'hace 15m',    passRate: 0.88 },
  { id: '64f3a1b2c8e4d50012a3b602', name: 'Triage Médico',           description: 'Pre-clasificación de síntomas para clínica',      provider: 'Anthropic', model: 'claude-opus-4-1',    version: '2.1.0', status: 'active',     testSets: 6, lastRun: 'hace 5m',     passRate: 0.79 },
  { id: '64f3a1b2c8e4d50012a3b603', name: 'Onboarding Bot',          description: 'Guía al usuario nuevo por la plataforma',         provider: 'OpenAI',    model: 'gpt-4o-mini',        version: '0.9.2', status: 'active',     testSets: 2, lastRun: 'hace 1d',     passRate: 0.96 },
  { id: '64f3a1b2c8e4d50012a3b604', name: 'Asistente de Soporte v0', description: 'Versión heredada — reemplazada por v1',          provider: 'OpenAI',    model: 'gpt-3.5-turbo',      version: '0.5.0', status: 'deprecated', testSets: 4, lastRun: 'hace 3 meses', passRate: 0.72 },
  { id: '64f3a1b2c8e4d50012a3b605', name: 'Generador FAQ',           description: 'Genera respuestas a preguntas frecuentes',        provider: 'Google',    model: 'gemini-1.5-pro',     version: '1.2.0', status: 'inactive',   testSets: 1, lastRun: 'hace 1 sem',  passRate: 0.85 },
];

export const MOCK_METRICS: Metric[] = [
  { id: '64f3a1b2c8e4d50012a3b500', name: 'Exactitud de Respuesta',   description: 'Qué tan exacta es la respuesta vs. expectedOutput',      type: 'accuracy',  value: 0.92, unit: 'ratio',      usage: 18 },
  { id: '64f3a1b2c8e4d50012a3b501', name: 'Latencia P95',             description: 'Tiempo de respuesta en el percentil 95',                  type: 'latency',   value: 1240, unit: 'ms',         usage: 22 },
  { id: '64f3a1b2c8e4d50012a3b502', name: 'Coherencia',               description: 'Consistencia con el contexto previo de la conversación',  type: 'coherence', value: 0.87, unit: 'score',      usage: 14 },
  { id: '64f3a1b2c8e4d50012a3b503', name: 'Relevancia Semántica',     description: 'Similitud semántica con la respuesta esperada',           type: 'relevance', value: 0.81, unit: 'ratio',      usage: 16 },
  { id: '64f3a1b2c8e4d50012a3b504', name: 'Toxicidad',                description: 'Detecta contenido tóxico, sesgado o inapropiado',        type: 'toxicity',  value: 0.02, unit: 'ratio',      usage: 22 },
  { id: '64f3a1b2c8e4d50012a3b505', name: 'Tasa de Alucinación',      description: 'Frecuencia de información inventada o incorrecta',       type: 'custom',    value: 0.06, unit: 'percentage', usage: 9  },
];

export const MOCK_TEST_SETS: TestSet[] = [
  { id: '64f3a1b2c8e4d50012a3b700', name: 'Suite de Saludo y Bienvenida',    description: 'Valida los flujos de saludo inicial del agente',          agentId: '64f3a1b2c8e4d50012a3b600', agentName: 'Asistente de Soporte v1', testCount: 12, lastRun: 'hace 2h',   passRate: 0.92, createdBy: 'Juan Erazo'    },
  { id: '64f3a1b2c8e4d50012a3b701', name: 'FAQs de Productos',               description: 'Respuestas a preguntas frecuentes del catálogo',           agentId: '64f3a1b2c8e4d50012a3b601', agentName: 'Asistente de Ventas',     testCount: 28, lastRun: 'hace 15m',  passRate: 0.89, createdBy: 'María García'  },
  { id: '64f3a1b2c8e4d50012a3b702', name: 'Manejo de Errores y Ambigüedad',  description: 'Casos donde el input es ambiguo o malformado',            agentId: '64f3a1b2c8e4d50012a3b600', agentName: 'Asistente de Soporte v1', testCount: 18, lastRun: 'hace 5h',   passRate: 0.78, createdBy: 'Juan Erazo'    },
  { id: '64f3a1b2c8e4d50012a3b703', name: 'Triage — Síntomas Respiratorios', description: 'Clasificación correcta para vías respiratorias',           agentId: '64f3a1b2c8e4d50012a3b602', agentName: 'Triage Médico',           testCount: 42, lastRun: 'hace 5m',   passRate: 0.81, createdBy: 'Sofía Herrera' },
  { id: '64f3a1b2c8e4d50012a3b704', name: 'Triage — Edge Cases Críticos',    description: 'Síntomas de emergencia que requieren escalado',            agentId: '64f3a1b2c8e4d50012a3b602', agentName: 'Triage Médico',           testCount: 16, lastRun: 'hace 30m',  passRate: 0.62, createdBy: 'Sofía Herrera' },
  { id: '64f3a1b2c8e4d50012a3b705', name: 'Retención de Contexto Multi-turno',description: 'El agente recuerda detalles de turnos previos',          agentId: '64f3a1b2c8e4d50012a3b601', agentName: 'Asistente de Ventas',     testCount: 24, lastRun: 'hace 1d',   passRate: 0.71, createdBy: 'Diego Martínez'},
  { id: '64f3a1b2c8e4d50012a3b706', name: 'Onboarding — Primer Uso',         description: 'Guía paso a paso para usuarios nuevos',                   agentId: '64f3a1b2c8e4d50012a3b603', agentName: 'Onboarding Bot',          testCount: 14, lastRun: 'hace 1d',   passRate: 0.96, createdBy: 'Carlos López'  },
];

export const MOCK_TESTS: Test[] = [
  { id: '64f3a1b2c8e4d50012a3b800', input: 'Hola, ¿cómo estás?',                                                       expectedOutput: '¡Hola! Estoy muy bien, ¿en qué puedo ayudarte hoy?',                                            category: 'greeting',            priority: 'medium',   testSetId: '64f3a1b2c8e4d50012a3b700', lastResult: 'pass'    },
  { id: '64f3a1b2c8e4d50012a3b801', input: 'Buenos días',                                                               expectedOutput: '¡Buenos días! ¿En qué puedo asistirte?',                                                      category: 'greeting',            priority: 'low',      testSetId: '64f3a1b2c8e4d50012a3b700', lastResult: 'pass'    },
  { id: '64f3a1b2c8e4d50012a3b802', input: '¿Cuáles son sus horarios de atención?',                                     expectedOutput: 'Nuestro horario de atención es de lunes a viernes de 8am a 6pm.',                             category: 'faq',                 priority: 'high',     testSetId: '64f3a1b2c8e4d50012a3b701', lastResult: 'pass'    },
  { id: '64f3a1b2c8e4d50012a3b803', input: 'asdfghjkl',                                                                 expectedOutput: 'Disculpa, no entendí tu mensaje. ¿Podrías reformularlo?',                                     category: 'error_handling',      priority: 'high',     testSetId: '64f3a1b2c8e4d50012a3b702', lastResult: 'fail'    },
  { id: '64f3a1b2c8e4d50012a3b804', input: 'Quiero cancelar mi suscripción pero también necesito una factura',           expectedOutput: 'Te ayudo con ambas cosas. Empecemos por la factura...',                                      category: 'intent_recognition',  priority: 'critical', testSetId: '64f3a1b2c8e4d50012a3b702', lastResult: 'partial' },
  { id: '64f3a1b2c8e4d50012a3b805', input: 'Recuerda que mi plan es Premium. ¿Cuánto pago?',                            expectedOutput: 'Tu plan Premium tiene un costo de $29.99/mes.',                                               category: 'context_retention',   priority: 'high',     testSetId: '64f3a1b2c8e4d50012a3b705', lastResult: 'pass'    },
  { id: '64f3a1b2c8e4d50012a3b806', input: 'Mi hijo de 3 años tiene fiebre de 39.5°C y dificultad para respirar',       expectedOutput: 'Esta es una emergencia. Llama al 123 o acude al servicio de urgencias inmediatamente.',       category: 'edge_case',           priority: 'critical', testSetId: '64f3a1b2c8e4d50012a3b704', lastResult: 'pass'    },
  { id: '64f3a1b2c8e4d50012a3b807', input: 'Tengo tos seca desde hace 3 días',                                           expectedOutput: 'Recomiendo agendar una cita con medicina general en los próximos 2-3 días.',                  category: 'intent_recognition',  priority: 'medium',   testSetId: '64f3a1b2c8e4d50012a3b703', lastResult: 'pass'    },
  { id: '64f3a1b2c8e4d50012a3b808', input: '¿Y qué medicamento tomo?',                                                  expectedOutput: 'Como asistente de triage no puedo recetar medicamentos. Consulta con tu médico.',             category: 'edge_case',           priority: 'critical', testSetId: '64f3a1b2c8e4d50012a3b703', lastResult: 'fail'    },
];

export const MOCK_RUNS: Run[] = [
  { id: 'run_8c2a', testSet: 'Triage — Síntomas Respiratorios',  agent: 'Triage Médico',           agentVersion: '2.1.0', started: 'hace 5m',   duration: '1m 42s', status: 'completed', pass: 34, fail: 8,  total: 42, passRate: 0.81, triggeredBy: 'Sofía Herrera'  },
  { id: 'run_8c2b', testSet: 'Triage — Edge Cases Críticos',      agent: 'Triage Médico',           agentVersion: '2.1.0', started: 'hace 30m',  duration: '58s',    status: 'completed', pass: 10, fail: 6,  total: 16, passRate: 0.62, triggeredBy: 'Sofía Herrera'  },
  { id: 'run_8c29', testSet: 'FAQs de Productos',                  agent: 'Asistente de Ventas',     agentVersion: '1.0.0', started: 'hace 15m',  duration: '2m 14s', status: 'completed', pass: 25, fail: 3,  total: 28, passRate: 0.89, triggeredBy: 'María García'   },
  { id: 'run_8c28', testSet: 'Suite de Saludo y Bienvenida',       agent: 'Asistente de Soporte v1', agentVersion: '1.0.0', started: 'hace 2h',   duration: '42s',    status: 'completed', pass: 11, fail: 1,  total: 12, passRate: 0.92, triggeredBy: 'Juan Erazo'    },
  { id: 'run_8c27', testSet: 'Manejo de Errores y Ambigüedad',     agent: 'Asistente de Soporte v1', agentVersion: '1.0.0', started: 'hace 5h',   duration: '1m 18s', status: 'completed', pass: 14, fail: 4,  total: 18, passRate: 0.78, triggeredBy: 'Juan Erazo'    },
  { id: 'run_8c26', testSet: 'Retención de Contexto Multi-turno',  agent: 'Asistente de Ventas',     agentVersion: '1.0.0', started: 'hace 1d',   duration: '3m 02s', status: 'completed', pass: 17, fail: 7,  total: 24, passRate: 0.71, triggeredBy: 'Diego Martínez' },
];
