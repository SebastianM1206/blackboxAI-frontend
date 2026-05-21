import type {
	Agent, User, TestSet, Test, Metric, Run,
	PaginatedResponse, ApiResponse, UserRole, RunStatus, TestResult,
} from '../types';
import { ApiError } from '../types';

const DB_KEY = 'bb.mock.db.v1';
const DB_VERSION = 1;
const DEFAULT_LATENCY = 140;

const MOCK_LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY ?? DEFAULT_LATENCY);
let mockEnabled = String(import.meta.env.VITE_USE_MOCKS ?? '').toLowerCase() === 'true';

export function isMockEnabled(): boolean {
	return mockEnabled;
}

export function setMockEnabled(next: boolean): void {
	mockEnabled = next;
}

interface MockDb {
	version: number;
	nextId: number;
	agents: Agent[];
	testSets: TestSet[];
	tests: Test[];
	metrics: Metric[];
	runs: Run[];
	users: User[];
}

function delay(): Promise<void> {
	if (!MOCK_LATENCY || Number.isNaN(MOCK_LATENCY) || MOCK_LATENCY <= 0) return Promise.resolve();
	return new Promise(resolve => setTimeout(resolve, MOCK_LATENCY));
}

function nowIso(): string {
	return new Date().toISOString();
}

function daysAgo(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() - days);
	return d.toISOString();
}

function hoursAgo(hours: number): string {
	const d = new Date();
	d.setHours(d.getHours() - hours);
	return d.toISOString();
}

function formatRelative(iso: string): string {
	const diff = Date.now() - Date.parse(iso);
	if (Number.isNaN(diff)) return iso;
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return 'hace instantes';
	if (mins < 60) return `hace ${mins} min`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `hace ${hrs} h`;
	const days = Math.floor(hrs / 24);
	return `hace ${days} d`;
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

function parseSession(): { email?: string; name?: string; uid?: string } {
	if (typeof window === 'undefined') return {};
	const raw = localStorage.getItem('bb.session.v1');
	if (!raw) return {};
	try {
		const s = JSON.parse(raw) as { email?: string; displayName?: string; localId?: string };
		return { email: s.email, name: s.displayName, uid: s.localId };
	} catch {
		return {};
	}
}

function genId(db: MockDb, prefix: string): string {
	db.nextId += 1;
	return `${prefix}_${db.nextId}`;
}

function seedDb(): MockDb {
	const agents: Agent[] = [
		{
			id: 'agent_1001',
			name: 'Agente Soporte',
			description: 'Resuelve dudas frecuentes y seguimiento de pedidos.',
			endpointUrl: 'https://api.ejemplo.com/soporte/chat',
			provider: 'OpenAI',
			model: 'gpt-4o-mini',
			version: '2.3.1',
			status: 'active',
			createdAt: daysAgo(18),
			updatedAt: daysAgo(2),
		},
		{
			id: 'agent_1002',
			name: 'Agente Ventas',
			description: 'Califica prospectos y responde dudas comerciales.',
			endpointUrl: 'https://api.ejemplo.com/ventas/chat',
			provider: 'Anthropic',
			model: 'claude-3.5-sonnet',
			version: '1.4.0',
			status: 'active',
			createdAt: daysAgo(25),
			updatedAt: daysAgo(4),
		},
		{
			id: 'agent_1003',
			name: 'Agente RRHH',
			description: 'Consultas internas de personal y politicas.',
			endpointUrl: 'https://api.ejemplo.com/rrhh/chat',
			provider: 'Google',
			model: 'gemini-1.5-pro',
			version: '0.9.2',
			status: 'inactive',
			createdAt: daysAgo(40),
			updatedAt: daysAgo(12),
		},
	];

	const testSets: TestSet[] = [
		{
			id: 'set_2001',
			name: 'Suite Onboarding',
			description: 'Flujos basicos de bienvenida y registro.',
			agentId: 'agent_1001',
			createdBy: 'ana@equipo.com',
			createdAt: daysAgo(14),
			updatedAt: daysAgo(3),
		},
		{
			id: 'set_2002',
			name: 'Suite Facturacion',
			description: 'Pagos, facturas y reembolsos.',
			agentId: 'agent_1001',
			createdBy: 'carlos@equipo.com',
			createdAt: daysAgo(10),
			updatedAt: daysAgo(2),
		},
		{
			id: 'set_2003',
			name: 'Ventas LATAM',
			description: 'Calificacion de leads y pricing regional.',
			agentId: 'agent_1002',
			createdBy: 'lucia@equipo.com',
			createdAt: daysAgo(20),
			updatedAt: daysAgo(6),
		},
		{
			id: 'set_2004',
			name: 'FAQ General',
			description: 'Preguntas frecuentes de primer nivel.',
			agentId: 'agent_1003',
			createdBy: 'mateo@equipo.com',
			createdAt: daysAgo(30),
			updatedAt: daysAgo(10),
		},
	];

	const tests: Test[] = [
		{
			id: 'test_3001',
			input: 'Hola, necesito ayuda con mi pedido.',
			expectedOutput: 'Claro, con gusto. Por favor comparte tu numero de pedido.',
			category: 'greeting',
			priority: 'medium',
			testSetId: 'set_2001',
			lastResult: 'pass',
			createdAt: daysAgo(12),
			updatedAt: daysAgo(2),
		},
		{
			id: 'test_3002',
			input: 'Como puedo crear una cuenta nueva?',
			expectedOutput: 'Puedes registrarte desde el boton "Crear cuenta" en la pantalla de inicio.',
			category: 'faq',
			priority: 'low',
			testSetId: 'set_2001',
			lastResult: 'pass',
			createdAt: daysAgo(12),
			updatedAt: daysAgo(2),
		},
		{
			id: 'test_3003',
			input: 'No me llega el correo de verificacion.',
			expectedOutput: 'Revisa spam y solicita un nuevo correo desde la pantalla de acceso.',
			category: 'error_handling',
			priority: 'high',
			testSetId: 'set_2001',
			lastResult: 'partial',
			createdAt: daysAgo(11),
			updatedAt: daysAgo(3),
		},
		{
			id: 'test_3004',
			input: 'Necesito una factura con NIT.',
			expectedOutput: 'Compartenos tu NIT y datos fiscales para generar la factura.',
			category: 'faq',
			priority: 'high',
			testSetId: 'set_2002',
			lastResult: 'pass',
			createdAt: daysAgo(9),
			updatedAt: daysAgo(2),
		},
		{
			id: 'test_3005',
			input: 'Como solicito un reembolso?',
			expectedOutput: 'Puedes solicitarlo desde tu panel en los primeros 30 dias.',
			category: 'edge_case',
			priority: 'critical',
			testSetId: 'set_2002',
			lastResult: 'fail',
			createdAt: daysAgo(9),
			updatedAt: daysAgo(1),
		},
		{
			id: 'test_3006',
			input: 'Tenemos mas de 200 usuarios, hay plan enterprise?',
			expectedOutput: 'Si, el plan enterprise ofrece SSO, SLA y soporte dedicado.',
			category: 'intent_recognition',
			priority: 'medium',
			testSetId: 'set_2003',
			lastResult: 'pass',
			createdAt: daysAgo(18),
			updatedAt: daysAgo(5),
		},
		{
			id: 'test_3007',
			input: 'Cuanto cuesta por usuario en Colombia?',
			expectedOutput: 'Tenemos precios regionales, te comparto la tabla LATAM.',
			category: 'faq',
			priority: 'medium',
			testSetId: 'set_2003',
			lastResult: 'pass',
			createdAt: daysAgo(17),
			updatedAt: daysAgo(6),
		},
		{
			id: 'test_3008',
			input: 'Quiero actualizar mis datos personales.',
			expectedOutput: 'Ingresa a Perfil y actualiza tus datos en la seccion "Mi cuenta".',
			category: 'faq',
			priority: 'low',
			testSetId: 'set_2004',
			lastResult: 'pass',
			createdAt: daysAgo(28),
			updatedAt: daysAgo(10),
		},
	];

	const metrics: Metric[] = [
		{
			id: 'metric_4001',
			name: 'Exactitud semantica',
			description: 'Coincidencia con la respuesta esperada.',
			type: 'accuracy',
			value: 0.91,
			unit: 'ratio',
			usage: 3,
			createdAt: daysAgo(22),
			updatedAt: daysAgo(3),
		},
		{
			id: 'metric_4002',
			name: 'Latencia p50',
			description: 'Tiempo promedio por respuesta.',
			type: 'latency',
			value: 980,
			unit: 'ms',
			usage: 4,
			createdAt: daysAgo(22),
			updatedAt: daysAgo(3),
		},
		{
			id: 'metric_4003',
			name: 'Coherencia',
			description: 'Consistencia de respuestas largas.',
			type: 'coherence',
			value: 0.84,
			unit: 'ratio',
			usage: 2,
			createdAt: daysAgo(22),
			updatedAt: daysAgo(4),
		},
		{
			id: 'metric_4004',
			name: 'Toxicidad',
			description: 'Bajo nivel de lenguaje ofensivo.',
			type: 'toxicity',
			value: 0.03,
			unit: 'ratio',
			usage: 4,
			createdAt: daysAgo(22),
			updatedAt: daysAgo(3),
		},
		{
			id: 'metric_4005',
			name: 'Relevancia',
			description: 'Responde directamente al objetivo.',
			type: 'relevance',
			value: 0.87,
			unit: 'ratio',
			usage: 3,
			createdAt: daysAgo(22),
			updatedAt: daysAgo(3),
		},
	];

	function makeRun(params: {
		id: string;
		testSetId: string;
		testSet: string;
		agentId: string;
		agent: string;
		agentVersion: string;
		pass: number;
		fail: number;
		status?: RunStatus;
		createdAt: string;
		triggeredBy: string;
	}): Run {
		const total = params.pass + params.fail;
		return {
			id: params.id,
			testSetId: params.testSetId,
			testSet: params.testSet,
			agentId: params.agentId,
			agent: params.agent,
			agentVersion: params.agentVersion,
			started: formatRelative(params.createdAt),
			duration: `${Math.max(6, Math.round(total * 0.09))}s`,
			status: params.status ?? 'completed',
			pass: params.pass,
			fail: params.fail,
			total,
			passRate: total ? params.pass / total : 0,
			triggeredBy: params.triggeredBy,
			createdAt: params.createdAt,
			updatedAt: params.createdAt,
		};
	}

	const runs: Run[] = [
		makeRun({
			id: 'run_5001',
			testSetId: 'set_2001',
			testSet: 'Suite Onboarding',
			agentId: 'agent_1001',
			agent: 'Agente Soporte',
			agentVersion: '2.3.1',
			pass: 18,
			fail: 2,
			createdAt: hoursAgo(6),
			triggeredBy: 'ana@equipo.com',
		}),
		makeRun({
			id: 'run_5002',
			testSetId: 'set_2002',
			testSet: 'Suite Facturacion',
			agentId: 'agent_1001',
			agent: 'Agente Soporte',
			agentVersion: '2.3.1',
			pass: 21,
			fail: 5,
			createdAt: hoursAgo(18),
			triggeredBy: 'carlos@equipo.com',
		}),
		makeRun({
			id: 'run_5003',
			testSetId: 'set_2003',
			testSet: 'Ventas LATAM',
			agentId: 'agent_1002',
			agent: 'Agente Ventas',
			agentVersion: '1.4.0',
			pass: 16,
			fail: 4,
			createdAt: daysAgo(1),
			triggeredBy: 'lucia@equipo.com',
		}),
		makeRun({
			id: 'run_5004',
			testSetId: 'set_2004',
			testSet: 'FAQ General',
			agentId: 'agent_1003',
			agent: 'Agente RRHH',
			agentVersion: '0.9.2',
			pass: 9,
			fail: 5,
			status: 'failed',
			createdAt: daysAgo(3),
			triggeredBy: 'mateo@equipo.com',
		}),
	];

	const users: User[] = [
		{
			id: 'user_6001',
			name: 'Ana Torres',
			email: 'ana@equipo.com',
			role: 'admin',
			createdAt: daysAgo(60),
			updatedAt: daysAgo(3),
		},
		{
			id: 'user_6002',
			name: 'Carlos Vega',
			email: 'carlos@equipo.com',
			role: 'tester',
			createdAt: daysAgo(45),
			updatedAt: daysAgo(5),
		},
		{
			id: 'user_6003',
			name: 'Lucia Rojas',
			email: 'lucia@equipo.com',
			role: 'viewer',
			createdAt: daysAgo(30),
			updatedAt: daysAgo(7),
		},
	];

	return {
		version: DB_VERSION,
		nextId: 7000,
		agents,
		testSets,
		tests,
		metrics,
		runs,
		users,
	};
}

let cache: MockDb | null = null;

function loadDb(): MockDb {
	if (typeof window === 'undefined') return seedDb();
	const raw = localStorage.getItem(DB_KEY);
	if (!raw) {
		const db = seedDb();
		localStorage.setItem(DB_KEY, JSON.stringify(db));
		return db;
	}
	try {
		const parsed = JSON.parse(raw) as MockDb;
		if (parsed.version !== DB_VERSION) throw new Error('version mismatch');
		return parsed;
	} catch {
		const db = seedDb();
		localStorage.setItem(DB_KEY, JSON.stringify(db));
		return db;
	}
}

function getDb(): MockDb {
	if (!cache) cache = loadDb();
	return cache;
}

function saveDb(db: MockDb): void {
	cache = db;
	if (typeof window === 'undefined') return;
	localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function paginate<T>(items: T[], page = 1, limit = 100): PaginatedResponse<T> {
	const safeLimit = Math.max(1, limit || 100);
	const safePage = Math.max(1, page || 1);
	const total = items.length;
	const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
	const start = (safePage - 1) * safeLimit;
	return {
		message: 'ok',
		data: items.slice(start, start + safeLimit),
		pagination: { total, page: safePage, limit: safeLimit, totalPages },
	};
}

function match(text: string | undefined, q: string): boolean {
	if (!text) return false;
	return text.toLowerCase().includes(q.toLowerCase());
}

function latestRun(runs: Run[]): Run | null {
	if (runs.length === 0) return null;
	const sorted = [...runs].sort((a, b) => {
		const da = Date.parse(a.createdAt ?? '');
		const db = Date.parse(b.createdAt ?? '');
		return (Number.isNaN(db) ? 0 : db) - (Number.isNaN(da) ? 0 : da);
	});
	return sorted[0] ?? null;
}

function enrichAgent(agent: Agent, db: MockDb): Agent {
	const sets = db.testSets.filter(s => s.agentId === agent.id);
	const runs = db.runs.filter(r => r.agentId === agent.id);
	const last = latestRun(runs);
	const passRate = last?.passRate ?? (runs.length ? runs.reduce((s, r) => s + r.passRate, 0) / runs.length : undefined);
	return {
		...agent,
		testSets: sets.length,
		lastRun: last?.started,
		passRate,
	};
}

function enrichTestSet(set: TestSet, db: MockDb): TestSet {
	const agent = db.agents.find(a => a.id === set.agentId);
	const tests = db.tests.filter(t => t.testSetId === set.id);
	const runs = db.runs.filter(r => r.testSetId === set.id);
	const last = latestRun(runs);
	return {
		...set,
		agentName: set.agentName ?? agent?.name,
		testCount: tests.length,
		lastRun: last?.started ?? set.lastRun,
		passRate: last?.passRate ?? set.passRate,
	};
}

function ensureUserRole(role?: UserRole): UserRole {
	if (role === 'admin' || role === 'tester' || role === 'viewer') return role;
	return 'admin';
}

export function upsertMockUser(input: { email: string; name?: string; uid?: string; role?: UserRole }): User {
	const db = getDb();
	const email = input.email.toLowerCase();
	const now = nowIso();
	const existing = db.users.find(u => u.email.toLowerCase() === email);
	if (existing) {
		existing.name = input.name ?? existing.name;
		existing.uid = input.uid ?? existing.uid;
		existing.role = ensureUserRole(input.role ?? existing.role);
		existing.updatedAt = now;
		saveDb(db);
		return existing;
	}
	const user: User = {
		id: genId(db, 'user'),
		name: input.name ?? email.split('@')[0],
		email,
		role: ensureUserRole(input.role),
		uid: input.uid,
		createdAt: now,
		updatedAt: now,
	};
	db.users.unshift(user);
	saveDb(db);
	return user;
}

function currentUserLabel(): string {
	const s = parseSession();
	return s.name || s.email || 'sistema@local';
}

function applyRunResults(db: MockDb, testSetId: string, passRate: number): void {
	const now = nowIso();
	const tests = db.tests.filter(t => t.testSetId === testSetId);
	for (const t of tests) {
		const r = Math.random();
		let result: TestResult = 'pass';
		if (r > passRate + 0.12) result = 'fail';
		else if (r > passRate) result = 'partial';
		t.lastResult = result;
		t.updatedAt = now;
	}
}

async function listUsers(p?: { page?: number; limit?: number; role?: string; q?: string }): Promise<PaginatedResponse<User>> {
	await delay();
	const db = getDb();
	let items = [...db.users];
	if (p?.role) items = items.filter(u => u.role === p.role);
	if (p?.q) items = items.filter(u => match(u.name, p.q!) || match(u.email, p.q!));
	return paginate(items, p?.page, p?.limit);
}

async function getUser(id: string): Promise<ApiResponse<User>> {
	await delay();
	const db = getDb();
	const found = db.users.find(u => u.id === id);
	if (!found) throw new ApiError('Usuario no encontrado', 404);
	return { message: 'ok', data: found };
}

async function createUser(data: Partial<User>): Promise<ApiResponse<User>> {
	await delay();
	const email = data.email ?? `user${Date.now()}@equipo.local`;
	const user = upsertMockUser({ email, name: data.name, role: data.role as UserRole, uid: data.uid });
	return { message: 'created', data: user };
}

async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
	await delay();
	const db = getDb();
	const user = db.users.find(u => u.id === id);
	if (!user) throw new ApiError('Usuario no encontrado', 404);
	user.name = data.name ?? user.name;
	user.email = data.email ?? user.email;
	user.role = ensureUserRole((data.role as UserRole) ?? user.role);
	user.updatedAt = nowIso();
	saveDb(db);
	return { message: 'ok', data: user };
}

async function deleteUser(id: string): Promise<{ message: string }> {
	await delay();
	const db = getDb();
	const before = db.users.length;
	db.users = db.users.filter(u => u.id !== id);
	if (db.users.length === before) throw new ApiError('Usuario no encontrado', 404);
	saveDb(db);
	return { message: 'deleted' };
}

async function listAgents(p?: { page?: number; limit?: number; status?: string; provider?: string; q?: string }): Promise<PaginatedResponse<Agent>> {
	await delay();
	const db = getDb();
	let items = [...db.agents];
	if (p?.status) items = items.filter(a => a.status === p.status);
	if (p?.provider) items = items.filter(a => a.provider === p.provider);
	if (p?.q) items = items.filter(a => match(a.name, p.q!) || match(a.description, p.q!));
	const enriched = items.map(a => enrichAgent(a, db));
	return paginate(enriched, p?.page, p?.limit);
}

async function getAgent(id: string): Promise<ApiResponse<Agent>> {
	await delay();
	const db = getDb();
	const agent = db.agents.find(a => a.id === id);
	if (!agent) throw new ApiError('Agente no encontrado', 404);
	return { message: 'ok', data: enrichAgent(agent, db) };
}

async function createAgent(data: Partial<Agent>): Promise<ApiResponse<Agent>> {
	await delay();
	const db = getDb();
	const now = nowIso();
	const agent: Agent = {
		id: genId(db, 'agent'),
		name: data.name?.trim() || `Agente ${db.nextId}`,
		description: data.description?.trim(),
		endpointUrl: data.endpointUrl || 'https://api.ejemplo.com/agent',
		provider: data.provider || 'custom',
		model: data.model || 'custom-model',
		version: data.version || '1.0.0',
		status: data.status || 'active',
		createdAt: now,
		updatedAt: now,
	};
	db.agents.unshift(agent);
	saveDb(db);
	return { message: 'created', data: enrichAgent(agent, db) };
}

async function updateAgent(id: string, data: Partial<Agent>): Promise<ApiResponse<Agent>> {
	await delay();
	const db = getDb();
	const agent = db.agents.find(a => a.id === id);
	if (!agent) throw new ApiError('Agente no encontrado', 404);
	agent.name = data.name ?? agent.name;
	agent.description = data.description ?? agent.description;
	agent.endpointUrl = data.endpointUrl ?? agent.endpointUrl;
	agent.provider = data.provider ?? agent.provider;
	agent.model = data.model ?? agent.model;
	agent.version = data.version ?? agent.version;
	agent.status = data.status ?? agent.status;
	agent.updatedAt = nowIso();
	saveDb(db);
	return { message: 'ok', data: enrichAgent(agent, db) };
}

async function deleteAgent(id: string): Promise<{ message: string }> {
	await delay();
	const db = getDb();
	const before = db.agents.length;
	db.agents = db.agents.filter(a => a.id !== id);
	if (db.agents.length === before) throw new ApiError('Agente no encontrado', 404);
	const removedSetIds = new Set(db.testSets.filter(s => s.agentId === id).map(s => s.id));
	db.testSets = db.testSets.filter(s => s.agentId !== id);
	db.tests = db.tests.filter(t => !removedSetIds.has(t.testSetId));
	db.runs = db.runs.filter(r => r.agentId !== id);
	saveDb(db);
	return { message: 'deleted' };
}

async function listTestSets(p?: { page?: number; limit?: number; agentId?: string; createdBy?: string; q?: string }): Promise<PaginatedResponse<TestSet>> {
	await delay();
	const db = getDb();
	let items = [...db.testSets];
	if (p?.agentId) items = items.filter(s => s.agentId === p.agentId);
	if (p?.createdBy) items = items.filter(s => s.createdBy === p.createdBy);
	if (p?.q) items = items.filter(s => match(s.name, p.q!) || match(s.description, p.q!));
	const enriched = items.map(s => enrichTestSet(s, db));
	return paginate(enriched, p?.page, p?.limit);
}

async function getTestSet(id: string): Promise<ApiResponse<TestSet>> {
	await delay();
	const db = getDb();
	const set = db.testSets.find(s => s.id === id);
	if (!set) throw new ApiError('Set no encontrado', 404);
	return { message: 'ok', data: enrichTestSet(set, db) };
}

async function createTestSet(data: Partial<TestSet>): Promise<ApiResponse<TestSet>> {
	await delay();
	const db = getDb();
	const now = nowIso();
	const agentId = data.agentId || db.agents[0]?.id || '';
	const createdBy = data.createdBy || currentUserLabel();
	const set: TestSet = {
		id: genId(db, 'set'),
		name: data.name?.trim() || `Set ${db.nextId}`,
		description: data.description?.trim(),
		agentId,
		createdBy,
		createdAt: now,
		updatedAt: now,
	};
	db.testSets.unshift(set);
	saveDb(db);
	return { message: 'created', data: enrichTestSet(set, db) };
}

async function updateTestSet(id: string, data: Partial<TestSet>): Promise<ApiResponse<TestSet>> {
	await delay();
	const db = getDb();
	const set = db.testSets.find(s => s.id === id);
	if (!set) throw new ApiError('Set no encontrado', 404);
	set.name = data.name ?? set.name;
	set.description = data.description ?? set.description;
	set.agentId = data.agentId ?? set.agentId;
	set.updatedAt = nowIso();
	saveDb(db);
	return { message: 'ok', data: enrichTestSet(set, db) };
}

async function deleteTestSet(id: string): Promise<{ message: string }> {
	await delay();
	const db = getDb();
	const before = db.testSets.length;
	db.testSets = db.testSets.filter(s => s.id !== id);
	if (db.testSets.length === before) throw new ApiError('Set no encontrado', 404);
	db.tests = db.tests.filter(t => t.testSetId !== id);
	db.runs = db.runs.filter(r => r.testSetId !== id);
	saveDb(db);
	return { message: 'deleted' };
}

async function listTests(p?: { page?: number; limit?: number; testSetId?: string; category?: string; priority?: string }): Promise<PaginatedResponse<Test>> {
	await delay();
	const db = getDb();
	let items = [...db.tests];
	if (p?.testSetId) items = items.filter(t => t.testSetId === p.testSetId);
	if (p?.category) items = items.filter(t => t.category === p.category);
	if (p?.priority) items = items.filter(t => t.priority === p.priority);
	return paginate(items, p?.page, p?.limit);
}

async function getTest(id: string): Promise<ApiResponse<Test>> {
	await delay();
	const db = getDb();
	const test = db.tests.find(t => t.id === id);
	if (!test) throw new ApiError('Test no encontrado', 404);
	return { message: 'ok', data: test };
}

async function createTest(data: Partial<Test>): Promise<ApiResponse<Test>> {
	await delay();
	const db = getDb();
	if (!data.testSetId) throw new ApiError('Falta testSetId', 400);
	const now = nowIso();
	const test: Test = {
		id: genId(db, 'test'),
		input: data.input?.trim() || 'Nuevo caso de prueba',
		expectedOutput: data.expectedOutput?.trim() || 'Respuesta esperada pendiente',
		category: data.category || 'faq',
		priority: data.priority || 'medium',
		testSetId: data.testSetId,
		lastResult: data.lastResult,
		createdAt: now,
		updatedAt: now,
	};
	db.tests.unshift(test);
	saveDb(db);
	return { message: 'created', data: test };
}

async function updateTest(id: string, data: Partial<Test>): Promise<ApiResponse<Test>> {
	await delay();
	const db = getDb();
	const test = db.tests.find(t => t.id === id);
	if (!test) throw new ApiError('Test no encontrado', 404);
	test.input = data.input ?? test.input;
	test.expectedOutput = data.expectedOutput ?? test.expectedOutput;
	test.category = data.category ?? test.category;
	test.priority = data.priority ?? test.priority;
	test.lastResult = data.lastResult ?? test.lastResult;
	test.updatedAt = nowIso();
	saveDb(db);
	return { message: 'ok', data: test };
}

async function deleteTest(id: string): Promise<{ message: string }> {
	await delay();
	const db = getDb();
	const before = db.tests.length;
	db.tests = db.tests.filter(t => t.id !== id);
	if (db.tests.length === before) throw new ApiError('Test no encontrado', 404);
	saveDb(db);
	return { message: 'deleted' };
}

async function listMetrics(p?: { page?: number; limit?: number; type?: string }): Promise<PaginatedResponse<Metric>> {
	await delay();
	const db = getDb();
	let items = [...db.metrics];
	if (p?.type) items = items.filter(m => m.type === p.type);
	return paginate(items, p?.page, p?.limit);
}

async function getMetric(id: string): Promise<ApiResponse<Metric>> {
	await delay();
	const db = getDb();
	const metric = db.metrics.find(m => m.id === id);
	if (!metric) throw new ApiError('Metrica no encontrada', 404);
	return { message: 'ok', data: metric };
}

async function createMetric(data: Partial<Metric>): Promise<ApiResponse<Metric>> {
	await delay();
	const db = getDb();
	const now = nowIso();
	const metric: Metric = {
		id: genId(db, 'metric'),
		name: data.name?.trim() || `Metrica ${db.nextId}`,
		description: data.description?.trim(),
		type: data.type || 'custom',
		value: data.value ?? 0.75,
		unit: data.unit || 'ratio',
		usage: data.usage ?? 0,
		createdAt: now,
		updatedAt: now,
	};
	db.metrics.unshift(metric);
	saveDb(db);
	return { message: 'created', data: metric };
}

async function updateMetric(id: string, data: Partial<Metric>): Promise<ApiResponse<Metric>> {
	await delay();
	const db = getDb();
	const metric = db.metrics.find(m => m.id === id);
	if (!metric) throw new ApiError('Metrica no encontrada', 404);
	metric.name = data.name ?? metric.name;
	metric.description = data.description ?? metric.description;
	metric.type = data.type ?? metric.type;
	metric.value = data.value ?? metric.value;
	metric.unit = data.unit ?? metric.unit;
	metric.usage = data.usage ?? metric.usage;
	metric.updatedAt = nowIso();
	saveDb(db);
	return { message: 'ok', data: metric };
}

async function deleteMetric(id: string): Promise<{ message: string }> {
	await delay();
	const db = getDb();
	const before = db.metrics.length;
	db.metrics = db.metrics.filter(m => m.id !== id);
	if (db.metrics.length === before) throw new ApiError('Metrica no encontrada', 404);
	saveDb(db);
	return { message: 'deleted' };
}

async function listRuns(p?: { page?: number; limit?: number; agentId?: string; testSetId?: string; status?: string }): Promise<PaginatedResponse<Run>> {
	await delay();
	const db = getDb();
	let items = [...db.runs];
	if (p?.agentId) items = items.filter(r => r.agentId === p.agentId);
	if (p?.testSetId) items = items.filter(r => r.testSetId === p.testSetId);
	if (p?.status) items = items.filter(r => r.status === p.status);
	items.sort((a, b) => {
		const da = Date.parse(a.createdAt ?? '');
		const dbb = Date.parse(b.createdAt ?? '');
		return (Number.isNaN(dbb) ? 0 : dbb) - (Number.isNaN(da) ? 0 : da);
	});
	return paginate(items, p?.page, p?.limit);
}

async function getRun(id: string): Promise<ApiResponse<Run>> {
	await delay();
	const db = getDb();
	const run = db.runs.find(r => r.id === id);
	if (!run) throw new ApiError('Ejecucion no encontrada', 404);
	return { message: 'ok', data: run };
}

async function createRun(data: Partial<Run> & { testSetId: string }): Promise<ApiResponse<Run>> {
	await delay();
	const db = getDb();
	const set = db.testSets.find(s => s.id === data.testSetId);
	if (!set) throw new ApiError('Set no encontrado', 404);
	const agent = db.agents.find(a => a.id === set.agentId);
	const tests = db.tests.filter(t => t.testSetId === set.id);
	const total = tests.length || set.testCount || 12;
	const base = set.passRate ?? (agent?.status === 'active' ? 0.86 : 0.72);
	const passRate = clamp(base + (Math.random() - 0.5) * 0.12, 0.4, 0.98);
	const pass = Math.max(0, Math.round(total * passRate));
	const fail = Math.max(0, total - pass);
	const createdAt = nowIso();
	const run: Run = {
		id: genId(db, 'run'),
		testSetId: set.id,
		testSet: set.name,
		agentId: agent?.id,
		agent: agent?.name ?? 'Agente',
		agentVersion: agent?.version ?? '1.0.0',
		started: formatRelative(createdAt),
		duration: `${Math.max(6, Math.round(total * (0.08 + Math.random() * 0.06)))}s`,
		status: 'completed',
		pass,
		fail,
		total,
		passRate: total ? pass / total : 0,
		triggeredBy: currentUserLabel(),
		createdAt,
		updatedAt: createdAt,
	};
	db.runs.unshift(run);
	set.lastRun = run.started;
	set.passRate = run.passRate;
	set.updatedAt = nowIso();
	applyRunResults(db, set.id, run.passRate);
	saveDb(db);
	return { message: 'created', data: run };
}

async function authSyncUser(data: { name?: string; email: string }): Promise<User | null> {
	await delay();
	const user = upsertMockUser({ email: data.email, name: data.name, role: 'admin' });
	return user;
}

async function authMe(): Promise<User | null> {
	await delay();
	const db = getDb();
	const s = parseSession();
	if (!s.email) return null;
	return db.users.find(u => u.email.toLowerCase() === s.email!.toLowerCase()) ?? null;
}

async function ping(): Promise<{ ok: boolean }> {
	await delay();
	return { ok: true };
}

export const mockApi = {
	users: {
		list: listUsers,
		get: getUser,
		create: createUser,
		update: updateUser,
		delete: deleteUser,
	},
	agents: {
		list: listAgents,
		get: getAgent,
		create: createAgent,
		update: updateAgent,
		delete: deleteAgent,
	},
	testSets: {
		list: listTestSets,
		get: getTestSet,
		create: createTestSet,
		update: updateTestSet,
		delete: deleteTestSet,
	},
	tests: {
		list: listTests,
		get: getTest,
		create: createTest,
		update: updateTest,
		delete: deleteTest,
	},
	metrics: {
		list: listMetrics,
		get: getMetric,
		create: createMetric,
		update: updateMetric,
		delete: deleteMetric,
	},
	runs: {
		list: listRuns,
		get: getRun,
		create: createRun,
	},
	auth: {
		syncUser: authSyncUser,
		me: authMe,
	},
	system: {
		ping,
	},
};

export function resetMockDb(): void {
	const db = seedDb();
	saveDb(db);
}
