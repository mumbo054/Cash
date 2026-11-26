import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  clearAllCache,
  generateIdempotencyKey,
  getCachedValue,
  invalidateCachePrefix,
  runSingleFlight,
  setCachedValue,
  withMutationLock,
} from '@/lib/cache';
import { ApiTimeoutError, createFetchWithTimeout } from '@/lib/supabase';
import {
  clearTelemetrySnapshot,
  createTraceparent,
  getTelemetrySnapshot,
  normalizeSupabaseOperation,
  recordApiTiming,
} from '@/lib/telemetry';
import { buildStatementLines, generatePdfBytesFromLines } from '@/lib/pdfExport';
import { appendUniqueTransactions, buildKeysetFilter } from '@/context/WalletContext';
import { formatINR } from '@/utils/formatters';
import type { Transaction } from '@/types/database.types';

describe('Request deduplication & SWR cache', () => {
  beforeEach(() => {
    clearAllCache();
  });

  it('deduplicates concurrent calls via runSingleFlight', async () => {
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 15));
      return { balance: 10000 };
    };

    const [a, b, c] = await Promise.all([
      runSingleFlight('wallet:1', fetcher),
      runSingleFlight('wallet:1', fetcher),
      runSingleFlight('wallet:1', fetcher),
    ]);

    expect(calls).toBe(1);
    expect(a).toEqual({ balance: 10000 });
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  it('prevents concurrent duplicate mutations via withMutationLock', async () => {
    let executed = 0;
    const slowMutation = async () => {
      executed += 1;
      await new Promise((r) => setTimeout(r, 25));
      return 'ok';
    };

    const [first, second] = await Promise.all([
      withMutationLock('sendMoney', slowMutation),
      withMutationLock('sendMoney', slowMutation),
    ]);

    expect(executed).toBe(1);
    expect(first).toEqual({ locked: false, result: 'ok' });
    expect(second).toEqual({ locked: true });
  });

  it('respects cache TTL and prefix invalidation', async () => {
    setCachedValue('userBundle:abc', { ok: true });
    expect(getCachedValue('userBundle:abc', 5000)).toEqual({ ok: true });

    invalidateCachePrefix('userBundle:');
    expect(getCachedValue('userBundle:abc', 5000)).toBeNull();
  });

  it('generates distinct idempotency keys', () => {
    const k1 = generateIdempotencyKey();
    const k2 = generateIdempotencyKey();
    expect(k1).not.toBe(k2);
    expect(k1.length).toBeGreaterThan(8);
  });
});

describe('API timeouts & telemetry', () => {
  beforeEach(() => {
    clearTelemetrySnapshot();
  });

  it('aborts hanging requests with ApiTimeoutError and avoids un-whitelisted headers', async () => {
    const hangingFetch = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const wrapped = createFetchWithTimeout(25, hangingFetch as unknown as typeof fetch);

    await expect(wrapped('https://example.supabase.co/rest/v1/wallets?select=id')).rejects.toThrow(
      ApiTimeoutError
    );

    const passedHeaders = hangingFetch.mock.calls[0]?.[1]?.headers as Record<string, string> | undefined;
    expect(passedHeaders?.['X-Client-Trace-Id']).toBeUndefined();
    expect(getTelemetrySnapshot().recent.at(-1)?.status).toBe('timeout');
  });

  it('normalizes URLs without exposing query parameters/PII and tracks slow calls', () => {
    expect(normalizeSupabaseOperation('https://x.supabase.co/rest/v1/profiles?email=eq.secret@test.com', 'get')).toBe(
      'GET rest:profiles'
    );

    recordApiTiming({
      traceId: 'csh_test',
      operation: 'GET rest:transactions',
      durationMs: 950,
      status: 200,
    });

    const snap = getTelemetrySnapshot();
    expect(snap.totalRequests).toBe(1);
    expect(snap.slowRequests).toBe(1);
    expect(snap.p95Ms).toBe(950);
  });
});

describe('Keyset pagination & INR formatters', () => {
  it('builds deterministic keyset filter for (created_at, id)', () => {
    expect(
      buildKeysetFilter({ created_at: '2026-11-26T10:00:00.000Z', id: 'tx-99' })
    ).toBe('created_at.lt.2026-11-26T10:00:00.000Z,and(created_at.eq.2026-11-26T10:00:00.000Z,id.lt.tx-99)');
  });

  it('deduplicates paginated transactions by ID', () => {
    const makeTx = (id: string): Transaction => ({
      id,
      reference_id: `REF_${id}`,
      type: 'debit',
      amount: 100,
      currency: 'INR',
      category: 'food',
      status: 'completed',
      counterparty_name: 'Swiggy',
      counterparty_upi_id: 'swiggy@upi',
      description: 'Lunch',
      created_at: '2026-11-26T10:00:00.000Z',
    });

    const merged = appendUniqueTransactions([makeTx('1'), makeTx('2')], [makeTx('2'), makeTx('3')]);
    expect(merged.map((t) => t.id)).toEqual(['1', '2', '3']);
  });

  it('formats INR amounts with Indian grouping', () => {
    expect(formatINR(1234567.89)).toBe('₹12,34,567.89');
    expect(formatINR('invalid')).toBe('₹0.00');
  });
});

describe('W3C Trace Context & Binary PDF Statements', () => {
  it('generates valid W3C traceparent header strings', () => {
    const tp = createTraceparent();
    expect(tp).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });

  it('builds reconciled PDF statement bytes with valid PDF-1.4 header & EOF', () => {
    const lines = buildStatementLines({
      holderName: 'Anand Kumar',
      upiId: 'anand@cash',
      walletMasked: 'CSH-••••1234',
      tier: 'pro',
      kycStatus: 'verified',
      openingBalance: 10000,
      totalCredits: 500,
      totalDebits: 200,
      closingBalance: 10300,
      generatedAtIso: '2026-11-26T12:00:00.000Z',
      rows: [
        {
          date: '2026-11-26T10:00:00.000Z',
          reference: 'CSH-20261126-ABCDEF',
          utr: 'UTR261126100000123',
          type: 'debit',
          category: 'food',
          counterparty: 'Swiggy',
          amount: 200,
          fee: 0,
          gst: 0,
          status: 'completed',
        },
      ],
    });

    const bytes = generatePdfBytesFromLines(lines);
    const header = new TextDecoder().decode(bytes.slice(0, 8));
    const tail = new TextDecoder().decode(bytes.slice(-10));
    expect(header).toBe('%PDF-1.4');
    expect(tail).toContain('%%EOF');
    expect(lines.some((l) => l.includes('UTR261126100000123'))).toBe(true);
  });
});
