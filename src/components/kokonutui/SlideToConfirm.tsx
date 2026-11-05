import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideToConfirmProps {
  onConfirm: () => Promise<void> | void;
  label?: string;
  confirmedLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function SlideToConfirm({
  onConfirm,
  label = 'Slide to Pay via UPI',
  confirmedLabel = 'Payment Dispatched!',
  className,
  disabled = false,
}: SlideToConfirmProps) {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    if (disabled || isConfirmed || isLoading) return;
    setIsDragging(true);
  };

  const handleEnd = async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (containerRef.current && thumbRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const thumbWidth = thumbRef.current.offsetWidth;
      const maxDrag = containerWidth - thumbWidth;

      if (sliderPosition >= maxDrag * 0.85) {
        setSliderPosition(maxDrag);
        setIsLoading(true);
        try {
          await onConfirm();
          setIsConfirmed(true);
          setTimeout(() => {
            setIsConfirmed(false);
            setSliderPosition(0);
          }, 2400);
        } catch {
          setSliderPosition(0);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSliderPosition(0);
      }
    }
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || isConfirmed || isLoading) return;

    if (containerRef.current && thumbRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const thumbWidth = thumbRef.current.offsetWidth;
      const maxDrag = containerRef.current.offsetWidth - thumbWidth;
      const currentDrag = Math.min(Math.max(0, clientX - rect.left - thumbWidth / 2), maxDrag);
      setSliderPosition(currentDrag);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, sliderPosition]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-14 w-full select-none overflow-hidden rounded-2xl bg-zinc-950/80 border border-white/15 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md transition-colors duration-300',
        isConfirmed && 'bg-[#00D632]/20 border-[#00D632]/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Background progress fill */}
      <div
        className="absolute inset-y-1.5 left-1.5 rounded-xl bg-gradient-to-r from-[#00D632]/20 to-[#00D632]/40 transition-all pointer-events-none"
        style={{ width: `${sliderPosition + 40}px` }}
      />

      {/* Centered instruction text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs font-semibold tracking-wide uppercase text-zinc-300">
          {isLoading ? (
            <span className="flex items-center gap-2 text-[#00D632]">
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying Bank Gateway...
            </span>
          ) : isConfirmed ? (
            <span className="flex items-center gap-1.5 text-[#00D632] font-bold">
              <Check className="w-4 h-4" /> {confirmedLabel}
            </span>
          ) : (
            label
          )}
        </span>
      </div>

      {/* Draggable thumb */}
      <div
        ref={thumbRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className={cn(
          'relative flex h-11 w-12 cursor-grab items-center justify-center rounded-xl bg-[#00D632] text-black font-bold shadow-lg shadow-[#00D632]/30 transition-transform active:cursor-grabbing hover:bg-[#00D632]/90',
          isDragging && 'scale-105 shadow-[#00D632]/50',
          isConfirmed && 'bg-[#00D632]'
        )}
        style={{
          transform: `translateX(${sliderPosition}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease-out',
        }}
      >
        {isConfirmed ? (
          <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
        ) : isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
        ) : (
          <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        )}
      </div>
    </div>
  );
}
