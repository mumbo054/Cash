export interface ApiTimingEntry {
  traceId: string;
  operation: string;
  durationMs: number;
  status: number | 'timeout' | 'error';
  slow: boolean;
  timestamp: string;
}

const SLOW_THRESHOLD_MS = 800;
const MAX_TIMING_ENTRIES = 100;
const apiTimings: ApiTimingEntry[] = [];

/**
 * Generates a compact correlation ID for client-to-Supabase request tracing.
 */
export function createTraceId(): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `csh_${Date.now().toString(36)}_${rand}`;
}

/**
 * Builds a W3C Trace Context `traceparent` header value (version 00, sampled flag 01).
 */
export function createTraceparent(): string {
  const hex = (len: number) => {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(Math.ceil(len / 2));
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, len);
    }
    return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };
  return `00-${hex(32)}-${hex(16)}-01`;
}

export interface EdgeHealthResult {
  status: string;
  service?: string;
  region?: string;
  latency_ms?: number;
  db_reachable?: boolean;
  traceparent?: string;
  error?: string;
}

export async function pingEdgeHealth(accessToken?: string): Promise<EdgeHealthResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return { status: 'unconfigured', error: 'Supabase URL missing' };
  }

  const traceparent = createTraceparent();
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/cash-ops`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        traceparent,
      },
    });
    const data = (await res.json()) as EdgeHealthResult;
    return { ...data, traceparent: data.traceparent || traceparent };
  } catch (err) {
    return {
      status: 'unreachable',
      error: err instanceof Error ? err.message : 'Health probe failed',
      traceparent,
    };
  }
}

/**
 * Normalizes a Supabase REST/RPC URL into a safe, PII-free operation label.
 */
export function normalizeSupabaseOperation(url: string, method = 'GET'): string {
  try {
    const parsed = new URL(url, 'https://placeholder.local');
    const cleanPath = parsed.pathname.replace(/^\/rest\/v1\//, 'rest:').replace(/^\/auth\/v1\//, 'auth:');
    return `${method.toUpperCase()} ${cleanPath}`;
  } catch {
    return `${method.toUpperCase()} unknown`;
  }
}

/**
 * Records request timing telemetry without logging personal data.
 */
export function recordApiTiming(entry: Omit<ApiTimingEntry, 'slow' | 'timestamp'>): ApiTimingEntry {
  const fullEntry: ApiTimingEntry = {
    ...entry,
    slow: entry.durationMs >= SLOW_THRESHOLD_MS,
    timestamp: new Date().toISOString(),
  };

  apiTimings.push(fullEntry);
  if (apiTimings.length > MAX_TIMING_ENTRIES) {
    apiTimings.shift();
  }

  if (fullEntry.slow && typeof console !== 'undefined') {
    console.warn(
      `[Cash Perf] Slow request (${Math.round(fullEntry.durationMs)}ms) [${fullEntry.traceId}] ${fullEntry.operation}`
    );
  }

  return fullEntry;
}

export function getTelemetrySnapshot() {
  const durations = apiTimings.map((t) => t.durationMs).sort((a, b) => a - b);
  const p95Index = durations.length > 0 ? Math.min(durations.length - 1, Math.floor(durations.length * 0.95)) : 0;

  return {
    totalRequests: apiTimings.length,
    slowRequests: apiTimings.filter((t) => t.slow).length,
    p95Ms: durations.length > 0 ? Math.round(durations[p95Index]) : 0,
    recent: apiTimings.slice(-20),
  };
}

export function clearTelemetrySnapshot() {
  apiTimings.length = 0;
}
