/**
 * Lightweight client-side request deduplication, SWR memory caching, and mutation guards.
 * Prevents duplicate concurrent API calls and redundant fetches across mounts/auth events.
 */

const inFlightRequests = new Map<string, Promise<unknown>>();
const activeMutations = new Set<string>();

interface CacheRecord<T> {
  data: T;
  updatedAt: number;
}

const memoryCache = new Map<string, CacheRecord<unknown>>();

/**
 * Deduplicates concurrent calls sharing the same cache key so only one network request executes.
 */
export function runSingleFlight<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const promise = fetcher().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Returns cached value if present and within TTL, or null if missing/expired.
 */
export function getCachedValue<T>(key: string, ttlMs: number): T | null {
  const record = memoryCache.get(key) as CacheRecord<T> | undefined;
  if (!record) return null;
  if (Date.now() - record.updatedAt > ttlMs) {
    return null;
  }
  return record.data;
}

export function setCachedValue<T>(key: string, data: T): void {
  memoryCache.set(key, { data, updatedAt: Date.now() });
}

export function invalidateCachePrefix(prefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

export function clearAllCache(): void {
  memoryCache.clear();
  inFlightRequests.clear();
}

/**
 * Prevents duplicate mutation execution (e.g. double-tapping a transfer or quick-add button).
 * Returns null if the same mutation key is currently in progress.
 */
export async function withMutationLock<T>(
  key: string,
  action: () => Promise<T>
): Promise<{ locked: true } | { locked: false; result: T }> {
  if (activeMutations.has(key)) {
    return { locked: true };
  }

  activeMutations.add(key);
  try {
    const result = await action();
    return { locked: false, result };
  } finally {
    activeMutations.delete(key);
  }
}

/**
 * Generates a unique idempotency key per user-initiated money transfer attempt.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `idk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
