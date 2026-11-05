import { Delete, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatINR } from '@/utils/formatters';

interface AmountPadProps {
  amount: number;
  onChange: (val: number) => void;
  maxAmount?: number;
  className?: string;
}

export function AmountPad({
  amount,
  onChange,
  maxAmount = 100000,
  className,
}: AmountPadProps) {
  const quickPills = [100, 500, 1000, 2000, 5000];

  const handleDigit = (digit: string) => {
    const str = amount.toString();
    if (amount === 0) {
      const val = parseFloat(digit);
      if (val <= maxAmount) onChange(val);
      return;
    }
    const nextStr = str + digit;
    const nextVal = parseFloat(nextStr);
    if (!isNaN(nextVal) && nextVal <= maxAmount) {
      onChange(nextVal);
    }
  };

  const handleBackspace = () => {
    const str = amount.toString();
    if (str.length <= 1) {
      onChange(0);
    } else {
      onChange(parseFloat(str.slice(0, -1)));
    }
  };

  const handleClear = () => {
    onChange(0);
  };

  const handleAddQuick = (val: number) => {
    const next = amount + val;
    if (next <= maxAmount) {
      onChange(next);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Big Display */}
      <div className="text-center py-3 bg-slate-900/60 rounded-2xl border border-slate-800/80">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Transfer Amount</span>
        <div className="text-3xl md:text-4xl font-extrabold text-white mt-1 tracking-tight flex items-center justify-center gap-1">
          <span className="text-emerald-400">₹</span>
          <span>{amount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Quick Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {quickPills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => handleAddQuick(pill)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700/60 text-slate-300 transition-all cursor-pointer active:scale-95"
          >
            +{formatINR(pill).replace('.00', '')}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          title="Reset amount"
          className="p-1.5 text-xs font-semibold rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-slate-400 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Numeric Keypad Grid */}
      <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            className="h-12 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-lg font-semibold text-slate-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleDigit('00')}
          className="h-12 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sm font-semibold text-slate-300 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-12 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-lg font-semibold text-slate-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-12 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 border border-slate-800 text-slate-400 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
