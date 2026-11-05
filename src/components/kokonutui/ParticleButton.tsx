"use client";

import React, { useState, useRef } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onConfirm?: () => Promise<void> | void;
  successText?: string;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "cash" | "outline" | "ghost" | "white";
  showArrow?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

/**
 * ParticleButton Component (Kokonut UI @kokonutui/particle-button)
 * Features dynamic particle explosion physics upon interaction, customized
 * with Cash App signature green accents and micro-haptic styling.
 */
export function ParticleButton({
  children,
  onConfirm,
  onClick,
  successText = "Success!",
  loadingText = "Processing...",
  variant = "cash",
  showArrow = false,
  className,
  disabled,
  ...props
}: ParticleButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [particles, setParticles] = useState<Particle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cash App signature green and neon particle palette
  const colors = ["#00D632", "#00FF55", "#22c55e", "#4ade80", "#ffffff"];

  const triggerParticles = (originX?: number, originY?: number) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    const centerX = originX ?? (rect ? rect.width / 2 : 0);
    const centerY = originY ?? (rect ? rect.height / 2 : 0);

    const newParticles: Particle[] = Array.from({ length: 32 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 90 + 50;
      return {
        id: Math.random() + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 2.5,
        alpha: 1,
      };
    });

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 850);
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status !== "idle" || disabled) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    const clickX = rect ? e.clientX - rect.left : undefined;
    const clickY = rect ? e.clientY - rect.top : undefined;

    triggerParticles(clickX, clickY);

    if (onClick) {
      onClick(e);
    }

    if (onConfirm) {
      setStatus("loading");
      try {
        await onConfirm();
        setStatus("success");
        setTimeout(() => setStatus("idle"), 1800);
      } catch {
        setStatus("idle");
      }
    }
  };

  const variantStyles = {
    cash: "bg-[#00D632] hover:bg-[#00e336] text-black font-bold shadow-[0_0_24px_rgba(0,214,50,0.35)] hover:shadow-[0_0_35px_rgba(0,214,50,0.55)] border border-[#00ff55]/40",
    outline: "bg-black/60 hover:bg-white/[0.06] text-white font-medium border border-white/15 hover:border-[#00D632]/50 hover:shadow-[0_0_20px_rgba(0,214,50,0.15)]",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-medium border border-transparent",
    white: "bg-white hover:bg-slate-100 text-black font-bold shadow-lg shadow-white/10 border border-white",
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled || status === "loading"}
        className={cn(
          "relative overflow-hidden rounded-full px-7 py-3 text-sm tracking-tight transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] select-none",
          variantStyles[variant],
          status === "success" && "bg-[#00D632] text-black",
          className
        )}
        {...props}
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>{loadingText}</span>
          </>
        )}
        {status === "success" && <span>{successText}</span>}
        {status === "idle" && (
          <>
            <span>{children}</span>
            {showArrow && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
          </>
        )}

        {/* Dynamic canvas particle bursts */}
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute rounded-full pointer-events-none animate-ping"
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
                  transform: `translate(${p.vx * 0.4}px, ${p.vy * 0.4}px)`,
                  transition: "all 0.8s cubic-bezier(0, 0.7, 0.1, 1)",
                }}
              />
            ))}
          </div>
        )}
      </button>
    </div>
  );
}

export default ParticleButton;
