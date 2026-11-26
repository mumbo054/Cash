import { getTelemetrySnapshot } from './telemetry';

export interface WebVitalsReport {
  fcpMs?: number;
  lcpMs?: number;
  cls?: number;
  inpMs?: number;
  ttfbMs?: number;
  connectionType?: string;
  saveData?: boolean;
}

declare global {
  interface Window {
    __CASH_PERF__?: {
      vitals: WebVitalsReport;
      getApiTelemetry: typeof getTelemetrySnapshot;
    };
  }
}

/**
 * Schedules a non-critical callback after initial page load and browser idle.
 */
export function runAfterPageLoad(task: () => void): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  let timerId: number | undefined;

  const schedule = () => {
    if (cancelled) return;
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(() => {
        if (!cancelled) task();
      }, { timeout: 2000 });
    } else {
      timerId = window.setTimeout(() => {
        if (!cancelled) task();
      }, 150);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener('load', schedule);
    const win = window as Window & { cancelIdleCallback?: (id: number) => void };
    if (idleId !== undefined && typeof win.cancelIdleCallback === 'function') {
      win.cancelIdleCallback(idleId);
    }
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
    }
  };
}

/**
 * Captures real user speed metrics (TTFB, FCP, LCP, CLS, INP) using browser PerformanceObserver
 * after initial page load so it never competes with rendering.
 */
export function initWebVitalsMonitoring(): () => void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  };

  const report: WebVitalsReport = {
    connectionType: nav.connection?.effectiveType,
    saveData: nav.connection?.saveData,
  };

  window.__CASH_PERF__ = {
    vitals: report,
    getApiTelemetry: getTelemetrySnapshot,
  };

  const observers: PerformanceObserver[] = [];

  const cleanupSchedule = runAfterPageLoad(() => {
    try {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) {
        report.ttfbMs = Math.round(navEntry.responseStart - navEntry.requestStart);
      }

      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            report.fcpMs = Math.round(entry.startTime);
          }
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
      observers.push(paintObserver);

      const lcpObserver = new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) {
          report.lcpMs = Math.round(last.startTime);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);

      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
          if (!entry.hadRecentInput && entry.value) {
            clsScore += entry.value;
            report.cls = Number(clsScore.toFixed(4));
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);

      let maxInp = 0;
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > maxInp) {
            maxInp = entry.duration;
            report.inpMs = Math.round(maxInp);
          }
        }
      });
      inpObserver.observe({ type: 'event', buffered: true });
      observers.push(inpObserver);
    } catch {
      // Ignore unsupported PerformanceObserver entry types on older browsers
    }

    const perfEndpoint = import.meta.env.VITE_PERF_BEACON_URL;
    if (perfEndpoint && typeof navigator.sendBeacon === 'function') {
      const flush = () => {
        if (document.visibilityState === 'hidden') {
          navigator.sendBeacon(
            perfEndpoint,
            JSON.stringify({
              vitals: report,
              api: getTelemetrySnapshot(),
            })
          );
        }
      };
      document.addEventListener('visibilitychange', flush, { once: true });
    }
  });

  return () => {
    cleanupSchedule();
    for (const obs of observers) {
      obs.disconnect();
    }
  };
}
