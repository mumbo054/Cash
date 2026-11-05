import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export function GlassCard({
  children,
  glow = false,
  intensity = 'medium',
  className,
  ...props
}: GlassCardProps) {
  const intensityMap = {
    low: 'bg-slate-900/40 backdrop-blur-md border-slate-800/60',
    medium: 'bg-slate-900/70 backdrop-blur-xl border-slate-800/80 shadow-xl shadow-black/40',
    high: 'bg-slate-900/90 backdrop-blur-2xl border-slate-700/80 shadow-2xl shadow-emerald-950/20',
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border transition-all duration-300',
        intensityMap[intensity],
        glow && 'hover:border-emerald-500/40 hover:shadow-emerald-900/20 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {/* Subtle top reflection sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/10 to-transparent" />
      {children}
    </div>
  );
}
