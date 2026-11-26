import { Skeleton } from '@/components/ui/skeleton';

export function TransactionRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-label="Loading transactions">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/[0.03]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Skeleton className="size-8 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <div className="space-y-1.5 flex flex-col items-end">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContactsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-y-4 gap-x-2 py-2" aria-busy="true" aria-label="Loading contacts">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2">
          <Skeleton className="size-14 rounded-[18px]" />
          <Skeleton className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  );
}

/**
 * Full-page fintech dashboard skeleton shown while restoring an active session
 * or fetching the lazy DashboardHome chunk.
 */
export function DashboardSkeleton() {
  return (
    <div
      className="flex min-h-screen w-full bg-black text-white font-sans antialiased"
      aria-busy="true"
      aria-label="Loading Cash dashboard"
    >
      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-zinc-950/85 p-4 justify-between">
        <div>
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Skeleton className="size-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <Skeleton className="h-3 w-28 mb-3" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="size-5 rounded-md" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center gap-3 px-2">
          <Skeleton className="size-5 rounded-md" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Top Header Skeleton */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/85 px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-xl" />
            <div className="space-y-1.5 hidden sm:block">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="hidden md:block h-8 w-28 rounded-full" />
            <Skeleton className="hidden lg:block h-8 w-32 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-2xl" />
          </div>
        </header>

        {/* Overview Grid Skeleton */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {/* Balance Tile (4 cols) */}
            <div className="md:col-span-4 h-[260px] rounded-3xl border border-white/10 bg-zinc-950/70 p-5 flex flex-col justify-between">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-32 rounded-lg" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-11 w-56" />
                <Skeleton className="h-3.5 w-48" />
              </div>
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
              </div>
            </div>

            {/* Virtual Card Tile (2 cols) */}
            <div className="md:col-span-2 h-[260px] rounded-3xl border border-white/10 bg-zinc-950/70 p-5 flex flex-col justify-between">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="size-6 rounded-full" />
              </div>
              <Skeleton className="h-7 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-44" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>

            {/* Expenditure Metric Tile (4 cols) */}
            <div className="md:col-span-4 h-[260px] rounded-3xl border border-white/10 bg-zinc-950/70 p-5 flex flex-col justify-between">
              <div className="flex justify-between">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-7 w-28 rounded-xl" />
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Quick Clearing Tile (2 cols) */}
            <div className="md:col-span-2 h-[260px] rounded-3xl border border-white/10 bg-zinc-950/70 p-5 flex flex-col justify-between">
              <Skeleton className="h-5 w-36" />
              <div className="space-y-2.5">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
              <Skeleton className="h-3.5 w-full" />
            </div>

            {/* Passbook Tile (3 cols) */}
            <div className="md:col-span-3 h-[260px] rounded-3xl border border-white/10 bg-zinc-950/70 p-5 flex flex-col justify-between">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-16" />
              </div>
              <TransactionRowSkeleton count={3} />
            </div>

            {/* Pockets & Goals Tile (3 cols) */}
            <div className="md:col-span-3 h-[260px] rounded-3xl border border-white/10 bg-zinc-950/70 p-5 flex flex-col justify-between">
              <div className="flex justify-between">
                <Skeleton className="h-7 w-40 rounded-xl" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
              <Skeleton className="h-3.5 w-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
