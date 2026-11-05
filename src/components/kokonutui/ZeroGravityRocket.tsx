import { Rocket, Sparkles, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatINR } from '@/utils/formatters';

interface ZeroGravityRocketProps {
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  category?: string;
  onContribute?: () => void;
  className?: string;
}

export function ZeroGravityRocket({
  title,
  targetAmount,
  currentAmount,
  targetDate,
  category = 'General',
  onContribute,
  className,
}: ZeroGravityRocketProps) {
  const percentage = Math.min(100, Math.round((currentAmount / targetAmount) * 100));
  const isCompleted = percentage >= 100;

  // The elevation height: higher percentage = rocket ascends higher toward the stratosphere
  const elevationPx = (percentage / 100) * 110;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900 border border-slate-800 p-5 shadow-xl transition-all duration-300 hover:border-slate-700',
        isCompleted && 'border-emerald-500/50 shadow-emerald-950/40',
        className
      )}
    >
      {/* Background Starfield */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-3 left-6 w-1 h-1 bg-white rounded-full animate-ping" />
        <div className="absolute top-12 right-10 w-1 h-1 bg-emerald-300 rounded-full" />
        <div className="absolute bottom-8 left-14 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-60" />
        <div className="absolute top-20 left-1/3 w-1 h-1 bg-amber-200 rounded-full" />
      </div>

      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {category}
          </span>
          <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-1.5">
            {title}
            {isCompleted && <Trophy className="w-4 h-4 text-amber-400" />}
          </h3>
          {targetDate && (
            <p className="text-xs text-slate-400 mt-0.5">Target: {new Date(targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
          )}
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-400">{percentage}% Fuel</span>
          <p className="text-sm font-bold text-slate-200 mt-0.5">{formatINR(currentAmount)}</p>
          <p className="text-[11px] text-slate-400">of {formatINR(targetAmount)}</p>
        </div>
      </div>

      {/* Flight Chamber: Visual Zero-Gravity Column */}
      <div className="relative h-44 w-full bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden my-3">
        {/* Stratosphere Moon / Orbit target */}
        <div className="absolute top-3 right-6 flex items-center gap-1.5 opacity-80">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 shadow-md shadow-amber-500/20 flex items-center justify-center text-[10px] font-bold text-slate-900">
            🌕
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Orbit Point</span>
        </div>

        {/* Orbit Grid lines */}
        <div className="absolute inset-x-4 top-1/4 border-b border-dashed border-slate-800 text-[10px] text-slate-600">75% High Altitude</div>
        <div className="absolute inset-x-4 top-2/4 border-b border-dashed border-slate-800 text-[10px] text-slate-600">50% Mid Flight</div>
        <div className="absolute inset-x-4 top-3/4 border-b border-dashed border-slate-800 text-[10px] text-slate-600">25% Atmospheric Exit</div>

        {/* The Rocket Container: Ascends based on elevationPx */}
        <div
          className="absolute transition-all duration-700 ease-out flex flex-col items-center"
          style={{
            bottom: `${20 + elevationPx}px`,
          }}
        >
          {/* Rocket Icon with Glow */}
          <div
            className={cn(
              'relative p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white shadow-lg transition-transform duration-300',
              isCompleted ? 'shadow-emerald-400/50 scale-110 animate-bounce' : 'shadow-cyan-500/30'
            )}
          >
            <Rocket className="w-6 h-6 transform -rotate-45" />
            {isCompleted && (
              <span className="absolute -top-2 -right-2 p-1 bg-amber-400 rounded-full text-slate-950">
                <Sparkles className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Thrust / Flame particle tail */}
          <div className="w-1.5 h-6 bg-gradient-to-b from-amber-400 via-rose-500 to-transparent rounded-full blur-[1px] animate-pulse mt-0.5" />
          <div className="w-3 h-2 bg-emerald-400/30 rounded-full blur-sm" />
        </div>
      </div>

      {/* Progress Bar & Actions */}
      <div className="space-y-3 relative z-10">
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500 rounded-full',
              isCompleted
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-slate-400">
            {isCompleted ? (
              <span className="text-emerald-400 font-semibold">Goal Reached! Liftoff Complete 🚀</span>
            ) : (
              <span>₹{(targetAmount - currentAmount).toLocaleString('en-IN')} remaining</span>
            )}
          </span>

          {onContribute && !isCompleted && (
            <button
              onClick={onContribute}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
            >
              + Add Funds
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
