import { createClient } from '@supabase/supabase-js';
import { createTraceId, normalizeSupabaseOperation, recordApiTiming } from './telemetry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const DEFAULT_API_TIMEOUT_MS = 12_000;

export class ApiTimeoutError extends Error {
  readonly timeoutMs: number;
  readonly traceId: string;

  constructor(timeoutMs: number, traceId: string) {
    super(`Request timed out after ${Math.round(timeoutMs / 1000)}s. Please check your connection and try again.`);
    this.name = 'ApiTimeoutError';
    this.timeoutMs = timeoutMs;
    this.traceId = traceId;
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Cash Security Warning]: Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing. Check .env configuration.'
  );
}

/**
 * Wraps fetch with an AbortController timeout and non-PII client request telemetry.
 * Avoids injecting un-whitelisted CORS headers so browser preflights to Supabase never fail.
 */
export function createFetchWithTimeout(
  timeoutMs: number = DEFAULT_API_TIMEOUT_MS,
  baseFetch: typeof fetch = fetch
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const traceId = createTraceId();
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const operation = normalizeSupabaseOperation(urlStr, init?.method || 'GET');
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

    let timedOut = false;
    const timeoutId = globalThis.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const externalSignal = init?.signal;
    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', onExternalAbort, { once: true });
      }
    }

    let status: number | 'timeout' | 'error' = 'error';
    try {
      const response = await baseFetch(input, {
        ...init,
        signal: controller.signal,
      });
      status = response.status;
      return response;
    } catch (err) {
      if (timedOut) {
        status = 'timeout';
        throw new ApiTimeoutError(timeoutMs, traceId);
      }
      throw err;
    } finally {
      globalThis.clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
      const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
      recordApiTiming({
        traceId,
        operation,
        durationMs: endedAt - startedAt,
        status,
      });
    }
  };
}

/**
 * Checks synchronously whether a persisted Supabase auth session token exists in localStorage.
 * Allows instant DashboardSkeleton rendering on boot for signed-in users without flashing LandingPage.
 */
export function hasStoredAuthSession(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = window.localStorage.getItem(key);
        if (raw && raw.includes('access_token')) {
          return true;
        }
      }
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Cash Supabase Client
 *
 * SECURITY NOTE:
 * - This client uses the standard Publishable/Anon Key.
 * - It is completely safe for public browser exposure because PostgreSQL
 *   Row Level Security (RLS) restricts queries to the currently authenticated user's data.
 * - The `service_role` key MUST NEVER be placed here or in any client-facing source code!
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    global: {
      fetch: createFetchWithTimeout(DEFAULT_API_TIMEOUT_MS),
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
