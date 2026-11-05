"use client";

/**
 * @author: @dorianbaffier
 * @description: Amount Pad
 * @version: 1.0.0
 * @date: 2026-10-21
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { ArrowUp, Check, Delete } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const MAX_WHOLE_DIGITS = 7;
const DIGIT = /^\d$/;
const KEY_LABELS: Record<string, string> = {
  back: "Delete",
  ".": "Decimal point",
};
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

export interface AmountPadProps {
  /** Who the money goes to. */
  recipient?: { name: string; handle?: string };
  /** Currency sign drawn before the amount. */
  currency?: string;
  /** Largest amount allowed in one go. */
  max?: number;
  /** Shown under the amount until you hit the cap. */
  balance?: number;
  /** One-tap amounts. */
  presets?: number[];
  onSend?: (amount: number) => void;
  className?: string;
}

/** One typed character, with an id that follows it as commas move around. */
interface Char {
  id: number;
  char: string;
}

interface Glyph {
  key: string;
  char: string;
  kind: "digit" | "sep" | "ghost";
}

const toNumber = (chars: Char[]) =>
  Number.parseFloat(chars.map((c) => c.char).join("") || "0");

const money = (value: number, currency: string) =>
  `${currency}${value.toLocaleString("en-IN", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

/** What typing `key` does to the amount: the new characters, or null if it can't take it. */
function typeKey(
  chars: Char[],
  key: string,
  make: (char: string) => Char
): Char[] | null {
  const point = chars.findIndex((c) => c.char === ".");
  if (key === ".") {
    if (point !== -1) {
      return null;
    }
    return chars.length === 0 ? [make("0"), make(".")] : [...chars, make(".")];
  }
  const centsFull = point !== -1 && chars.length - point > 2;
  const wholeFull = point === -1 && chars.length >= MAX_WHOLE_DIGITS;
  if (centsFull || wholeFull) {
    return null;
  }
  // A lone leading zero is replaced, not followed.
  return chars.length === 1 && chars[0].char === "0"
    ? [make(key)]
    : [...chars, make(key)];
}

/**
 * Lays typed characters out as an amount: commas every three whole digits,
 * keyed by the digit they sit in front of, and faint zeros after the point.
 */
function layout(chars: Char[]): Glyph[] {
  const point = chars.findIndex((c) => c.char === ".");
  const whole = point === -1 ? chars : chars.slice(0, point);
  const glyphs: Glyph[] = [];

  whole.forEach((c, index) => {
    const fromRight = whole.length - index;
    if (index > 0 && fromRight % 3 === 0) {
      glyphs.push({ key: `comma-${c.id}`, char: ",", kind: "sep" });
    }
    glyphs.push({ key: `d-${c.id}`, char: c.char, kind: "digit" });
  });

  if (point !== -1) {
    const cents = chars.slice(point + 1);
    glyphs.push({ key: `d-${chars[point].id}`, char: ".", kind: "sep" });
    for (const c of cents) {
      glyphs.push({ key: `d-${c.id}`, char: c.char, kind: "digit" });
    }
    for (let i = cents.length; i < 2; i++) {
      glyphs.push({ key: `ghost-${i}`, char: "0", kind: "ghost" });
    }
  }
  return glyphs;
}

export default function AmountPad({
  recipient = { name: "Aarav Sharma", handle: "@aarav" },
  currency = "₹",
  max = 100000,
  balance = 45280.5,
  presets = [500, 1000, 2000, 5000],
  onSend,
  className,
}: AmountPadProps) {
  const [chars, setChars] = useState<Char[]>([]);
  const [capped, setCapped] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const nextId = useRef(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);
  const capTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sentTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fit = useMotionValue(1);
  const shakeX = useMotionValue(0);

  const value = toNumber(chars);
  const empty = chars.length === 0;

  useEffect(
    () => () => {
      clearTimeout(capTimer.current);
      clearTimeout(sentTimer.current);
    },
    []
  );

  // The amount shrinks to stay on one line as it grows
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const amount = amountRef.current;
    if (!(frame && amount)) {
      return;
    }
    const measure = () => {
      const target = Math.min(1, frame.clientWidth / amount.scrollWidth);
      animate(
        fit,
        target,
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 380, damping: 34 }
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(amount);
    return () => observer.disconnect();
  }, [fit, reduceMotion]);

  const refuse = useCallback(
    (showCap: boolean) => {
      if (showCap) {
        setCapped(true);
        clearTimeout(capTimer.current);
        capTimer.current = setTimeout(() => setCapped(false), 1800);
      }
      if (!reduceMotion) {
        animate(shakeX, [0, -10, 9, -6, 4, 0], {
          duration: 0.36,
          ease: "easeOut",
        });
      }
    },
    [reduceMotion, shakeX]
  );

  const make = (char: string): Char => {
    const id = nextId.current;
    nextId.current += 1;
    return { id, char };
  };

  const clearSent = () => {
    clearTimeout(sentTimer.current);
    setSent(null);
  };

  const press = (key: string) => {
    clearSent();
    if (key === "back") {
      setChars((current) => current.slice(0, -1));
      setCapped(false);
      return;
    }

    const next = typeKey(chars, key, make);
    if (!next) {
      refuse(false);
    } else if (toNumber(next) > max) {
      refuse(true);
    } else {
      setChars(next);
    }
  };

  const preset = (amount: number) => {
    clearSent();
    setCapped(false);
    setChars([...String(Math.min(amount, max))].map(make));
  };

  const send = () => {
    if (sent !== null) {
      return;
    }
    if (empty || value <= 0) {
      refuse(false);
      return;
    }
    onSend?.(value);
    setSent(value);
    clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => {
      setChars([]);
      setSent(null);
    }, 1600);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    let key: string | null = null;
    if (DIGIT.test(event.key) || event.key === ".") {
      key = event.key;
    } else if (event.key === ",") {
      key = ".";
    } else if (event.key === "Backspace") {
      key = "back";
    }
    if (key) {
      event.preventDefault();
      press(key);
    }
  };

  const glyphs = layout(chars);
  const initials = recipient.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col rounded-3xl border border-white/15 bg-zinc-950/85 p-6 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all",
        className
      )}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Recipient Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#00D632]/15 font-semibold text-[#00D632] text-sm border border-[#00D632]/30 shadow-inner">
          {initials}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Pay via UPI to</p>
          <p className="truncate font-semibold text-sm text-zinc-100">
            {recipient.name}
            {recipient.handle && (
              <span className="ml-1.5 font-normal text-zinc-500 text-xs">
                {recipient.handle}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Amount Display */}
      <div
        className="mt-6 flex h-20 items-center justify-center overflow-hidden"
        ref={frameRef}
      >
        <output aria-live="polite" className="sr-only">
          {money(value, currency)}
        </output>
        <motion.div
          aria-hidden="true"
          className="flex origin-center items-baseline whitespace-nowrap font-bold text-[52px] text-zinc-100 tabular-nums leading-none tracking-tight"
          style={{ scale: fit, x: shakeX }}
          ref={amountRef}
        >
          <span className="mr-1 text-3xl font-medium text-[#00D632]">{currency}</span>
          {empty ? (
            <span className="text-zinc-600">0</span>
          ) : (
            glyphs.map((g) => (
              <span
                key={g.key}
                className={cn(
                  g.kind === "sep" && "text-zinc-400 font-medium",
                  g.kind === "ghost" && "text-zinc-600",
                  g.kind === "digit" && "text-zinc-100"
                )}
              >
                {g.char}
              </span>
            ))
          )}
        </motion.div>
      </div>

      {/* Cap Warning or Available Balance */}
      <div className="mt-1 text-center min-h-[20px]">
        <AnimatePresence mode="wait">
          {capped ? (
            <motion.p
              key="capped"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-xs font-medium text-rose-400"
            >
              Maximum limit {money(max, currency)} per UPI transaction
            </motion.p>
          ) : (
            <motion.p
              key="bal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-zinc-500"
            >
              Available balance: <span className="text-zinc-300 font-medium">{money(balance, currency)}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Presets */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => preset(p)}
            className="rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-[#00D632]/40 hover:bg-[#00D632]/10 hover:text-[#00D632] active:scale-95 cursor-pointer"
          >
            +{p.toLocaleString("en-IN")}
          </button>
        ))}
      </div>

      {/* Keypad */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            aria-label={KEY_LABELS[k] ?? k}
            onClick={() => press(k)}
            className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/50 text-lg font-medium text-zinc-200 transition-all hover:bg-zinc-800 hover:border-white/20 active:scale-95 cursor-pointer"
          >
            {k === "back" ? <Delete className="size-5 text-zinc-400" /> : k}
          </button>
        ))}
      </div>

      {/* Send Button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={send}
          disabled={empty || value <= 0}
          className={cn(
            "flex h-13 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98]",
            sent !== null
              ? "bg-[#00D632] text-black shadow-[#00D632]/25"
              : empty || value <= 0
              ? "bg-zinc-800/60 text-zinc-600 cursor-not-allowed border border-white/5"
              : "bg-[#00D632] text-black hover:bg-[#00D632]/90 shadow-[#00D632]/20"
          )}
        >
          {sent !== null ? (
            <>
              <Check className="size-5 stroke-[2.5]" />
              <span>Paid {money(sent, currency)} via UPI!</span>
            </>
          ) : (
            <>
              <ArrowUp className="size-4 stroke-[2.5]" />
              <span>Pay {empty ? "" : money(value, currency)} via UPI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
