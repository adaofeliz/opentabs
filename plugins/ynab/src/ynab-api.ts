import {
  ToolError,
  getMetaContent,
  getPageGlobal,
  getCurrentUrl,
  waitUntil,
  parseRetryAfterMs,
  getAuthCache,
  setAuthCache,
  clearAuthCache,
} from '@opentabs-dev/plugin-sdk';

// --- Types ---

interface YnabAuth {
  sessionToken: string;
  deviceId: string;
  appVersion: string;
  userId: string;
  planId: string;
}

interface CatalogResponse<T = Record<string, unknown>> {
  error: { message: string } | null;
  session_token?: string;
  [key: string]: unknown;
  data?: T;
}

// --- Auth extraction ---
// YNAB uses HttpOnly session cookies for primary auth, plus a session token
// embedded in a <meta name="session-token"> tag. The internal API requires
// this token in the X-Session-Token header along with device identification
// headers. The user ID comes from YNAB_CLIENT_CONSTANTS.USER.

const generateDeviceId = (): string => crypto.randomUUID();

const extractPlanId = (): string | null => {
  const url = getCurrentUrl();
  const match = url.match(/app\.ynab\.com\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
  return match?.[1] ?? null;
};

const getAuth = (): YnabAuth | null => {
  const cached = getAuthCache<YnabAuth>('ynab');
  if (cached?.sessionToken && cached.planId) return cached;

  const sessionToken = getMetaContent('session-token');
  if (!sessionToken) return null;

  const user = getPageGlobal('YNAB_CLIENT_CONSTANTS.USER') as { id?: string } | undefined;
  if (!user?.id) return null;

  const planId = extractPlanId();
  if (!planId) return null;

  const appVersion = (getPageGlobal('YNAB_CLIENT_CONSTANTS.YNAB_APP_VERSION') as string | undefined) ?? '26.33.1';

  const deviceId = cached?.deviceId ?? generateDeviceId();

  const auth: YnabAuth = {
    sessionToken,
    deviceId,
    appVersion,
    userId: user.id,
    planId,
  };
  setAuthCache('ynab', auth);
  return auth;
};

export const isAuthenticated = (): boolean => getAuth() !== null;

export const waitForAuth = (): Promise<boolean> =>
  waitUntil(() => isAuthenticated(), { interval: 500, timeout: 5000 }).then(
    () => true,
    () => false,
  );

export const getPlanId = (): string => {
  const auth = getAuth();
  if (!auth) throw ToolError.auth('Not authenticated — please log in to YNAB.');
  return auth.planId;
};

// --- Internal API headers ---

const getHeaders = (): Record<string, string> => {
  const auth = getAuth();
  if (!auth) throw ToolError.auth('Not authenticated — please log in to YNAB.');
  return {
    'X-Session-Token': auth.sessionToken,
    'X-YNAB-Device-Id': auth.deviceId,
    'X-YNAB-Device-OS': 'web',
    'X-YNAB-Device-App-Version': auth.appVersion,
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json, text/javascript, */*; q=0.01',
  };
};

// --- Error handling ---

const handleApiError = async (response: Response, context: string): Promise<never> => {
  const errorBody = (await response.text().catch(() => '')).substring(0, 512);

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const retryMs = retryAfter !== null ? parseRetryAfterMs(retryAfter) : undefined;
    throw ToolError.rateLimited(`Rate limited: ${context} — ${errorBody}`, retryMs);
  }
  if (response.status === 401 || response.status === 403) {
    clearAuthCache('ynab');
    throw ToolError.auth(`Auth error (${response.status}): ${errorBody}`);
  }
  if (response.status === 404) throw ToolError.notFound(`Not found: ${context} — ${errorBody}`);
  if (response.status === 422) throw ToolError.validation(`Validation error: ${context} — ${errorBody}`);
  throw ToolError.internal(`API error (${response.status}): ${context} — ${errorBody}`);
};

// --- Catalog API (internal RPC endpoint) ---
// YNAB's web app uses POST /api/v1/catalog with operation_name + request_data
// as the primary data access mechanism for budget operations.

export const catalog = async <T = Record<string, unknown>>(
  operationName: string,
  requestData: Record<string, unknown> = {},
): Promise<CatalogResponse<T>> => {
  const headers = getHeaders();
  headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

  let response: Response;
  try {
    response = await fetch('/api/v1/catalog', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: `operation_name=${encodeURIComponent(operationName)}&request_data=${encodeURIComponent(JSON.stringify(requestData))}`,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'TimeoutError')
      throw ToolError.timeout(`Catalog request timed out: ${operationName}`);
    if (err instanceof DOMException && err.name === 'AbortError') throw new ToolError('Request was aborted', 'aborted');
    throw new ToolError(`Network error: ${err instanceof Error ? err.message : String(err)}`, 'network_error', {
      category: 'internal',
      retryable: true,
    });
  }

  if (!response.ok) return handleApiError(response, operationName);

  const data = (await response.json()) as CatalogResponse<T>;
  if (data.error) {
    throw ToolError.internal(`Catalog error (${operationName}): ${data.error.message}`);
  }
  return data;
};

// --- Sync write helper ---
// Write operations require the current server_knowledge to succeed.
// This fetches it first, then sends the write in one round-trip.

export const syncWrite = async (planId: string, changedEntities: Record<string, unknown>): Promise<CatalogResponse> => {
  // Step 1: Get current server knowledge with a read sync
  const readResult = await catalog('syncBudgetData', {
    budget_version_id: planId,
    starting_device_knowledge: 0,
    ending_device_knowledge: 0,
    device_knowledge_of_server: 0,
  });

  const serverKnowledge = (readResult as Record<string, unknown>).current_server_knowledge ?? 0;

  // Step 2: Write with correct knowledge values
  return catalog('syncBudgetData', {
    budget_version_id: planId,
    starting_device_knowledge: 0,
    ending_device_knowledge: 1,
    device_knowledge_of_server: serverKnowledge,
    calculated_entities_included: false,
    changed_entities: changedEntities,
  });
};

// --- REST API (internal v2 endpoints) ---

export const api = async <T>(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
  } = {},
): Promise<T> => {
  const headers = getHeaders();

  let fetchBody: string | undefined;
  if (options.body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(`/api/v2${endpoint}`, {
      method: options.method ?? 'GET',
      headers,
      body: fetchBody,
      credentials: 'include',
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'TimeoutError')
      throw ToolError.timeout(`API request timed out: ${endpoint}`);
    if (err instanceof DOMException && err.name === 'AbortError') throw new ToolError('Request was aborted', 'aborted');
    throw new ToolError(`Network error: ${err instanceof Error ? err.message : String(err)}`, 'network_error', {
      category: 'internal',
      retryable: true,
    });
  }

  if (!response.ok) return handleApiError(response, endpoint);

  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
};
