"use client";

/**
 * @author: @dorianbaffier
 * @description: Account Menu
 * @version: 2.0.0
 * @date: 2026-10-14
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Monitor,
  Moon,
  Plus,
  QrCode,
  Sun,
  ShieldCheck,
} from "lucide-react";
import {
  animate,
  motion,
  type Transition,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface Account {
  id: string;
  name: string;
  email: string;
  /** Shown in the avatar. Defaults to the first letters of `name`. */
  initials?: string;
  /** Plain label shown in the menu header, such as "Pro". */
  plan?: string;
}

export type AccountStatus = "online" | "away" | "busy";
export type AccountTheme = "light" | "dark" | "system";

export interface ProfileMenuItem {
  label: string;
  icon?: ReactNode;
  /** Quiet text on the right, such as a plan name or a shortcut. */
  value?: string;
  /** Renders the item as a link. Without it the item is a button. */
  href?: string;
  /** Opens `href` in a new tab. */
  external?: boolean;
  onSelect?: () => void;
}

interface ProfileDropdownProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  accounts?: Account[];
  defaultAccountId?: string;
  onAccountChange?: (account: Account) => void;
  onAddAccount?: () => void;
  /** Menu entries between the settings rows and Switch account. */
  items?: ProfileMenuItem[];
  /** Controlled theme. Leave it out to keep the choice in local state. */
  theme?: AccountTheme;
  defaultTheme?: AccountTheme;
  onThemeChange?: (theme: AccountTheme) => void;
  status?: AccountStatus;
  defaultStatus?: AccountStatus;
  onStatusChange?: (status: AccountStatus) => void;
  /** Called once Sign out has been held for `holdDuration` ms. */
  onSignOut?: () => void;
  holdDuration?: number;
  onOpenQR?: () => void;
}

const SAMPLE_ACCOUNTS: Account[] = [
  { id: "personal", name: "Aarav Sharma", email: "aarav.sharma@example.com", plan: "KYC Verified" },
  { id: "business", name: "Aarav Ventures", email: "aarav@ventures.in", plan: "Current A/c" },
];

const STATUSES: {
  id: AccountStatus;
  label: string;
  name: string;
  dot: string;
}[] = [
  { id: "online", label: "Active", name: "Online", dot: "bg-[#00D632]" },
  { id: "away", label: "Away", name: "Away", dot: "bg-amber-400" },
  { id: "busy", label: "DND", name: "Do not disturb", dot: "bg-rose-500" },
];

const THEMES = [
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "OLED", Icon: Monitor },
  { id: "light", label: "Light", Icon: Sun },
] as const;

const AVATAR_TONES = [
  "bg-[#00D632]/20 text-[#00D632] border border-[#00D632]/30",
  "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  "bg-sky-500/20 text-sky-300 border border-sky-500/30",
];

const WHITESPACE = /\s+/;
const PANEL_W = 300;
const RADIUS = 18;
const SPRING: Transition = { type: "spring", duration: 0.3, bounce: 0 };
const INDICATOR_SPRING: Transition = {
  type: "spring",
  duration: 0.25,
  bounce: 0,
};
const INSTANT: Transition = { duration: 0 };
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const NAV_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
]);

const ITEM_CLASS =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-zinc-300 outline-none transition-colors duration-150 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white";

type Phase = "closed" | "open" | "closing";
type Page = "main" | "accounts";
type Via = "pointer" | "keyboard";

function initialsOf(account: Account) {
  if (account.initials) {
    return account.initials;
  }
  return account.name
    .split(WHITESPACE)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function viaOf(event: MouseEvent): Via {
  return event.detail === 0 ? "keyboard" : "pointer";
}

function menuItems(root: HTMLElement | null) {
  if (!root) {
    return [];
  }
  return Array.from(root.querySelectorAll<HTMLElement>("[data-menu-item]"));
}

function sideTarget(items: HTMLElement[], current: HTMLElement, step: number) {
  const row = items.filter((item) => item.dataset.row === current.dataset.row);
  if (row.length < 2) {
    return;
  }
  const index = row.indexOf(current);
  return row[(index + step + row.length) % row.length];
}

function rowTarget(items: HTMLElement[], current: HTMLElement, step: number) {
  const rows = [...new Set(items.map((item) => item.dataset.row))];
  const index = rows.indexOf(current.dataset.row);
  const next = rows[(index + step + rows.length) % rows.length];
  const candidates = items.filter((item) => item.dataset.row === next);
  return (
    candidates.find((item) => item.getAttribute("aria-checked") === "true") ??
    candidates[0]
  );
}

function nextTarget(
  items: HTMLElement[],
  active: Element | null,
  key: string
): HTMLElement | undefined {
  if (key === "Home") {
    return items[0];
  }
  if (key === "End") {
    return items.at(-1);
  }
  const current = items.find((item) => item === active);
  if (!current) {
    return key === "ArrowUp" ? items.at(-1) : items[0];
  }
  if (key === "ArrowLeft" || key === "ArrowRight") {
    return sideTarget(items, current, key === "ArrowRight" ? 1 : -1);
  }
  return rowTarget(items, current, key === "ArrowDown" ? 1 : -1);
}

function useControllable<T>(
  value: T | undefined,
  fallback: T,
  onChange?: (next: T) => void
) {
  const [local, setLocal] = useState(fallback);
  const set = (next: T) => {
    setLocal(next);
    onChange?.(next);
  };
  return [value ?? local, set] as const;
}

function Avatar({
  account,
  tone,
  status,
  className,
}: {
  account: Account;
  tone: number;
  status?: AccountStatus;
  className?: string;
}) {
  const dot = STATUSES.find((entry) => entry.id === status)?.dot;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 select-none place-items-center rounded-xl font-bold text-xs tracking-wide shadow-inner",
        AVATAR_TONES[tone % AVATAR_TONES.length],
        className
      )}
    >
      {initialsOf(account)}
      {dot ? (
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-black transition-colors duration-200",
            dot
          )}
        />
      ) : null}
    </span>
  );
}

function Identity({
  uid,
  shared,
  account,
  tone,
  status,
  transition,
  stacked,
}: {
  uid: string;
  shared: boolean;
  account: Account;
  tone: number;
  status: AccountStatus;
  transition: Transition;
  stacked: boolean;
}) {
  const hidden = shared ? undefined : "invisible";
  return (
    <span
      className={cn(
        "flex min-w-0",
        stacked ? "flex-col items-start gap-2.5" : "items-center gap-2.5"
      )}
    >
      <motion.span
        className={cn("relative z-20 block", hidden)}
        key={shared ? "avatar-shared" : "avatar-static"}
        layoutId={shared ? `${uid}-avatar` : undefined}
        transition={transition}
      >
        <Avatar
          account={account}
          className={stacked ? "size-10" : "size-7"}
          status={status}
          tone={tone}
        />
      </motion.span>
      <span className="flex min-w-0 flex-col text-left">
        <motion.span
          className={cn(
            "relative z-20 block truncate font-semibold text-xs text-white leading-tight",
            hidden
          )}
          key={shared ? "name-shared" : "name-static"}
          layoutId={shared ? `${uid}-name` : undefined}
          transition={transition}
        >
          {account.name}
        </motion.span>
        <motion.span
          className={cn(
            "relative z-20 block truncate text-[11px] text-zinc-400 font-mono leading-tight",
            hidden
          )}
          key={shared ? "email-shared" : "email-static"}
          layoutId={shared ? `${uid}-email` : undefined}
          transition={transition}
        >
          {account.email}
        </motion.span>
      </span>
    </span>
  );
}

function Separator() {
  return (
    <hr className="mx-2 my-1.5 h-px border-0 bg-white/10" />
  );
}

function HoldSignOut({
  duration,
  onComplete,
}: {
  duration: number;
  onComplete: (via: Via) => void;
}) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const [nudge, setNudge] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const nudgeTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(nudgeTimer.current);
    },
    []
  );

  const start = (via: Via) => {
    if (timer.current !== undefined || done) {
      return;
    }
    window.clearTimeout(nudgeTimer.current);
    setNudge(false);
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setHolding(false);
      setDone(true);
      onComplete(via);
    }, duration);
  };

  const cancel = () => {
    if (timer.current === undefined) {
      return;
    }
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setHolding(false);
    setNudge(true);
    nudgeTimer.current = window.setTimeout(() => setNudge(false), 1400);
  };

  const label = (
    <>
      <LogOut className="size-3.5 text-rose-400" />
      <span className="flex-1 font-medium text-rose-300">Sign out of Cash</span>
      <span className="text-[10px] text-zinc-500 font-mono">
        {nudge ? "Keep holding..." : "Hold 1s"}
      </span>
    </>
  );

  return (
    <button
      className={cn(ITEM_CLASS, "relative touch-none select-none hover:bg-rose-500/10")}
      data-menu-item=""
      data-row="sign-out"
      onBlur={cancel}
      onClick={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!event.repeat) {
            start("keyboard");
          }
        }
      }}
      onKeyUp={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cancel();
        }
      }}
      onPointerCancel={cancel}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        start("pointer");
      }}
      onPointerUp={cancel}
      role="menuitem"
      tabIndex={-1}
      type="button"
    >
      {label}
      <span className="sr-only">, press and hold to confirm</span>
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center gap-2.5 rounded-xl bg-rose-600 px-2.5 text-white"
        style={{
          clipPath:
            holding || done
              ? "inset(0 0 0 0 round 12px)"
              : "inset(0 100% 0 0 round 12px)",
          transition: holding
            ? `clip-path ${duration}ms linear`
            : "clip-path 240ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function StatusRow({
  status,
  onChange,
}: {
  status: AccountStatus;
  onChange: (status: AccountStatus) => void;
}) {
  return (
    <fieldset
      aria-label="Status"
      className="m-0 flex min-w-0 items-center justify-between border-0 py-1 pr-1 pl-2.5"
    >
      <span className="text-xs text-zinc-400 font-medium">Status</span>
      <span className="flex gap-1">
        {STATUSES.map((entry) => {
          const checked = entry.id === status;
          return (
            <button
              aria-checked={checked}
              aria-label={entry.name}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] outline-none transition-colors duration-100 cursor-pointer",
                checked
                  ? "bg-white/10 text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
              data-menu-item=""
              data-row="status"
              key={entry.id}
              onClick={() => onChange(entry.id)}
              role="menuitemradio"
              tabIndex={-1}
              type="button"
            >
              <span
                className={cn(
                  "size-2 rounded-full transition-colors duration-200",
                  checked ? entry.dot : "bg-zinc-600"
                )}
              />
              {entry.label}
            </button>
          );
        })}
      </span>
    </fieldset>
  );
}

function ThemeRow({
  uid,
  theme,
  onChange,
  reduced,
}: {
  uid: string;
  theme: AccountTheme;
  onChange: (theme: AccountTheme) => void;
  reduced: boolean;
}) {
  return (
    <fieldset
      aria-label="Theme"
      className="m-0 flex min-w-0 items-center justify-between border-0 py-1 pr-1 pl-2.5"
    >
      <span className="text-xs text-zinc-400 font-medium">Theme</span>
      <span className="flex rounded-lg bg-zinc-900/80 border border-white/10 p-0.5">
        {THEMES.map(({ id, label, Icon }) => {
          const checked = id === theme;
          return (
            <button
              aria-checked={checked}
              aria-label={label}
              className="relative grid h-6 w-8 place-items-center rounded-md text-zinc-400 outline-none transition-colors duration-150 hover:text-white aria-checked:text-white cursor-pointer"
              data-menu-item=""
              data-row="theme"
              key={id}
              onClick={() => onChange(id)}
              role="menuitemradio"
              tabIndex={-1}
              type="button"
            >
              {checked ? (
                <motion.span
                  className="absolute inset-0 rounded-md bg-white/20 shadow-sm"
                  layoutId={`${uid}-theme`}
                  transition={reduced ? INSTANT : INDICATOR_SPRING}
                />
              ) : null}
              <Icon className="relative size-3" />
            </button>
          );
        })}
      </span>
    </fieldset>
  );
}

function LinkItem({
  item,
  index,
  onSelect,
}: {
  item: ProfileMenuItem;
  index: number;
  onSelect: (event: MouseEvent, run?: () => void) => void;
}) {
  const inner = (
    <>
      <span className="text-zinc-400 group-hover:text-white">{item.icon}</span>
      <span className="flex-1 font-medium">{item.label}</span>
      {item.value ? (
        <span className="text-[10px] text-[#00D632] font-mono bg-[#00D632]/10 border border-[#00D632]/20 px-1.5 py-0.5 rounded">
          {item.value}
        </span>
      ) : null}
    </>
  );
  const common = {
    className: cn(ITEM_CLASS, "group"),
    "data-menu-item": "",
    "data-row": `item-${index}`,
    onClick: (event: MouseEvent) => onSelect(event, item.onSelect),
    role: "menuitem",
    tabIndex: -1,
  } as const;
  if (item.href) {
    return (
      <a
        {...common}
        href={item.href}
        {...(item.external && { rel: "noopener noreferrer", target: "_blank" })}
      >
        {inner}
      </a>
    );
  }
  return (
    <button {...common} type="button">
      {inner}
    </button>
  );
}

export default function ProfileDropdown({
  accounts = SAMPLE_ACCOUNTS,
  defaultAccountId,
  onAccountChange,
  onAddAccount,
  items,
  theme: themeProp,
  defaultTheme = "system",
  onThemeChange,
  status: statusProp,
  defaultStatus = "online",
  onStatusChange,
  onSignOut,
  holdDuration = 1000,
  onOpenQR,
  className,
  ...props
}: ProfileDropdownProps) {
  const uid = useId();
  const reduced = useReducedMotion() === true;
  const [phase, setPhase] = useState<Phase>("closed");
  const [instant, setInstant] = useState(false);
  const [page, setPage] = useState<Page>("main");
  const [openSeq, setOpenSeq] = useState(0);
  const [accountId, setAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id
  );
  const [theme, setTheme] = useControllable(
    themeProp,
    defaultTheme,
    onThemeChange
  );
  const [status, setStatus] = useControllable(
    statusProp,
    defaultStatus,
    onStatusChange
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const accountsRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("closed");
  phaseRef.current = phase;
  const openIntent = useRef<{
    focus: "first" | "last" | "menu";
    resume: boolean;
  }>({ focus: "menu", resume: false });
  const pageFocus = useRef<"first" | "switch" | null>(null);
  const closeSeq = useRef(0);
  const targetH = useRef(0);

  const w = useMotionValue(0);
  const h = useMotionValue(0);
  const pageX = useMotionValue(0);
  const bodyOpacity = useMotionValue(1);
  const outerClip = useMotionTemplate`inset(0px 0px calc(100% - ${h}px) calc(100% - ${w}px) round ${RADIUS}px)`;
  const innerClip = useMotionTemplate`inset(1px 1px calc(100% - ${h}px + 1px) calc(100% - ${w}px + 1px) round ${RADIUS - 1}px)`;
  const pageTransform = useMotionTemplate`translate3d(${pageX}px, 0, 0)`;

  const account = accounts.find((entry) => entry.id === accountId) ??
    accounts[0] ?? { id: "guest", name: "Guest User", email: "guest@cash.in" };
  const tone = Math.max(0, accounts.indexOf(account));
  const others = accounts.filter((entry) => entry.id !== account.id);
  const sharedTransition = instant ? INSTANT : SPRING;
  const sharedInPanel = phase === "open";
  const menuId = `${uid}-menu`;

  // Default Cash app menu items if not supplied
  const resolvedItems: ProfileMenuItem[] = items ?? [
    {
      label: "My UPI QR & ID Card",
      icon: <QrCode className="size-4 text-[#00D632]" />,
      value: "3D Flip",
      onSelect: onOpenQR,
    },
    {
      label: "Bank & Card Transfers",
      icon: <CreditCard className="size-4 text-purple-400" />,
      value: "Zero Fee",
    },
    {
      label: "Limits & Security",
      icon: <ShieldCheck className="size-4 text-emerald-400" />,
      value: "₹1,00,000",
    },
  ];

  const pageEl = (target: Page) =>
    target === "main" ? mainRef.current : accountsRef.current;

  const openMenu = (via: Via, focus: "first" | "last" | "menu") => {
    if (phaseRef.current === "open") {
      return;
    }
    openIntent.current = { focus, resume: phaseRef.current === "closing" };
    closeSeq.current += 1;
    setInstant(via === "keyboard" || reduced);
    setPage("main");
    setPhase("open");
    setOpenSeq((seq) => seq + 1);
  };

  const closeMenu = (via: Via, returnFocus: boolean) => {
    if (phaseRef.current !== "open") {
      return;
    }
    const trigger = triggerRef.current;
    if (returnFocus) {
      trigger?.focus({ preventScroll: true });
    }
    if (via === "keyboard" || reduced || !trigger) {
      setInstant(true);
      setPhase("closed");
      return;
    }
    setInstant(false);
    setPhase("closing");
    const seq = ++closeSeq.current;
    animate(bodyOpacity, 0, { duration: 0.12, ease: EASE_OUT });
    animate(w, trigger.offsetWidth, SPRING);
    animate(h, trigger.offsetHeight, SPRING).then(() => {
      if (closeSeq.current === seq) {
        setPhase("closed");
      }
    });
  };

  const goTo = (target: Page) => {
    pageFocus.current = target === "accounts" ? "first" : "switch";
    setPage(target);
  };

  const select = (event: MouseEvent, run?: () => void) => {
    run?.();
    closeMenu(viaOf(event), true);
  };

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const main = mainRef.current;
    if (openSeq === 0 || phaseRef.current !== "open" || !trigger || !main) {
      return;
    }
    pageX.jump(0);
    targetH.current = main.offsetHeight;
    if (instant) {
      w.jump(PANEL_W);
      h.jump(targetH.current);
      bodyOpacity.jump(1);
    } else {
      if (!openIntent.current.resume) {
        w.jump(trigger.offsetWidth);
        h.jump(trigger.offsetHeight);
        bodyOpacity.jump(0);
      }
      animate(w, PANEL_W, SPRING);
      animate(h, targetH.current, SPRING);
      animate(bodyOpacity, 1, { duration: 0.2, delay: 0.05, ease: EASE_OUT });
    }
    const list = menuItems(main);
    const targets = {
      first: list[0],
      last: list.at(-1),
      menu: main.querySelector<HTMLElement>("[role=menu]"),
    };
    targets[openIntent.current.focus]?.focus({ preventScroll: true });
  }, [openSeq]);

  useEffect(() => {
    const el = pageEl(page);
    if (phaseRef.current !== "open" || !el) {
      return;
    }
    const x = page === "main" ? 0 : -PANEL_W;
    targetH.current = el.offsetHeight;
    if (reduced) {
      pageX.jump(x);
      h.jump(targetH.current);
    } else {
      animate(pageX, x, SPRING);
      animate(h, targetH.current, SPRING);
    }
    const intent = pageFocus.current;
    pageFocus.current = null;
    if (intent === "first") {
      const list = menuItems(el);
      const checked = list.find(
        (item) => item.getAttribute("aria-checked") === "true"
      );
      (checked ?? list[0])?.focus({ preventScroll: true });
    } else if (intent === "switch") {
      el.querySelector<HTMLElement>("[data-switch]")?.focus({
        preventScroll: true,
      });
    }
  }, [page]);

  useEffect(() => {
    if (phase !== "open") {
      return;
    }
    const observer = new ResizeObserver(() => {
      const el = pageEl(page);
      if (!el || phaseRef.current !== "open") {
        return;
      }
      const next = el.offsetHeight;
      if (Math.abs(next - targetH.current) < 0.5) {
        return;
      }
      targetH.current = next;
      animate(h, next, reduced ? INSTANT : SPRING);
    });
    for (const el of [mainRef.current, accountsRef.current]) {
      if (el) {
        observer.observe(el);
      }
    }
    return () => observer.disconnect();
  }, [phase, page]);

  useEffect(() => {
    if (phase !== "open") {
      return;
    }
    const onDown = (event: globalThis.PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        closeMenu("pointer", false);
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [phase]);

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      closeMenu("keyboard", true);
      return;
    }
    if (page === "accounts" && event.key === "Backspace") {
      event.preventDefault();
      goTo("main");
      return;
    }
    if (!NAV_KEYS.has(event.key)) {
      return;
    }
    event.preventDefault();
    const active = document.activeElement;
    const target = nextTarget(menuItems(pageEl(page)), active, event.key);
    if (target) {
      target.focus({ preventScroll: true });
    } else if (page === "accounts" && event.key === "ArrowLeft") {
      goTo("main");
    } else if (
      event.key === "ArrowRight" &&
      active instanceof HTMLElement &&
      active.dataset.switch !== undefined
    ) {
      goTo("accounts");
    }
  };

  const onPanelPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-menu-item]"
    );
    if (item && document.activeElement !== item) {
      item.focus({ preventScroll: true });
    }
  };

  return (
    <div
      className={cn(
        "relative isolate inline-block",
        phase !== "closed" && "z-50",
        className
      )}
      ref={wrapperRef}
      {...props}
    >
      {/* Trigger Button styled with Apple glass */}
      <button
        aria-controls={sharedInPanel ? menuId : undefined}
        aria-expanded={sharedInPanel}
        aria-haspopup="menu"
        className="flex w-52 sm:w-60 items-center gap-2.5 rounded-2xl border border-white/15 bg-zinc-900/80 p-1.5 pr-2.5 text-left outline-none backdrop-blur-md transition-all hover:border-white/25 hover:bg-zinc-800/80 focus-visible:ring-2 focus-visible:ring-[#00D632]/50 shadow-sm cursor-pointer"
        onClick={(event) => {
          const via = viaOf(event);
          openMenu(via, via === "keyboard" ? "first" : "menu");
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu("keyboard", event.key === "ArrowDown" ? "first" : "last");
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <span className="min-w-0 flex-1">
          <Identity
            account={account}
            shared={!sharedInPanel}
            stacked={false}
            status={status}
            tone={tone}
            transition={sharedTransition}
            uid={uid}
          />
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0 text-zinc-400 transition-opacity duration-150",
            phase !== "closed" && "opacity-0"
          )}
        />
      </button>

      {/* Morphing Glass Dropdown Panel */}
      {phase === "closed" ? null : (
        <div
          className="pointer-events-none absolute top-0 right-0 z-50"
          style={{ width: PANEL_W }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 [filter:drop-shadow(0_20px_40px_rgba(0,0,0,0.85))]"
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              style={{ clipPath: outerClip }}
            />
            <motion.div
              className="absolute inset-0 bg-zinc-950/95 backdrop-blur-2xl border border-white/20"
              style={{ clipPath: innerClip }}
            />
          </div>
          <motion.div
            className={cn("relative", sharedInPanel && "pointer-events-auto")}
            onKeyDown={onPanelKeyDown}
            onPointerMove={onPanelPointerMove}
            style={{ clipPath: innerClip }}
          >
            <motion.div
              className="flex w-max items-start"
              style={{ transform: pageTransform }}
            >
              {/* Main Page */}
              <div
                className={cn(
                  "shrink-0 p-2 transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  page !== "main" && "opacity-0"
                )}
                {...({ inert: page !== "main" ? "" : undefined } as any)}
                ref={mainRef}
                style={{ width: PANEL_W }}
              >
                <div className="flex items-start justify-between px-2.5 pt-2 pb-2.5">
                  <Identity
                    account={account}
                    shared={sharedInPanel}
                    stacked
                    status={status}
                    tone={tone}
                    transition={sharedTransition}
                    uid={uid}
                  />
                  {account.plan ? (
                    <motion.span
                      className="shrink-0 pt-0.5 text-[10px] font-semibold text-[#00D632] uppercase bg-[#00D632]/10 border border-[#00D632]/25 px-2 py-0.5 rounded-full"
                      style={{ opacity: bodyOpacity }}
                    >
                      {account.plan}
                    </motion.span>
                  ) : null}
                </div>
                <motion.div
                  aria-label={account.name}
                  className="outline-none"
                  id={menuId}
                  role="menu"
                  style={{ opacity: bodyOpacity }}
                  tabIndex={-1}
                >
                  <StatusRow onChange={setStatus} status={status} />
                  <ThemeRow
                    onChange={setTheme}
                    reduced={reduced}
                    theme={theme}
                    uid={uid}
                  />
                  <Separator />
                  {resolvedItems.map((item, index) => (
                    <LinkItem
                      index={index}
                      item={item}
                      key={item.label}
                      onSelect={select}
                    />
                  ))}
                  {accounts.length > 1 ? (
                    <button
                      aria-expanded={page === "accounts"}
                      aria-haspopup="menu"
                      className={ITEM_CLASS}
                      data-menu-item=""
                      data-row="switch"
                      data-switch=""
                      onClick={() => goTo("accounts")}
                      role="menuitem"
                      tabIndex={-1}
                      type="button"
                    >
                      <span className="flex -space-x-1.5">
                        {others.slice(0, 2).map((entry) => (
                          <Avatar
                            account={entry}
                            className="size-5 text-[8px] ring-2 ring-black"
                            key={entry.id}
                            tone={accounts.indexOf(entry)}
                          />
                        ))}
                      </span>
                      <span className="flex-1 font-medium">Switch Account</span>
                      <ChevronRight className="size-3.5 text-zinc-400" />
                    </button>
                  ) : null}
                  <Separator />
                  <HoldSignOut
                    duration={holdDuration}
                    onComplete={(via) => {
                      onSignOut?.();
                      closeMenu(via, true);
                    }}
                  />
                </motion.div>
              </div>

              {/* Accounts Page */}
              <div
                className={cn(
                  "shrink-0 p-2 transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  page !== "accounts" && "opacity-0"
                )}
                {...({ inert: page !== "accounts" ? "" : undefined } as any)}
                ref={accountsRef}
                style={{ width: PANEL_W }}
              >
                <motion.div
                  aria-label="Switch account"
                  className="outline-none"
                  role="menu"
                  style={{ opacity: bodyOpacity }}
                  tabIndex={-1}
                >
                  <button
                    className={cn(ITEM_CLASS, "gap-1.5 pl-1.5 font-semibold text-white")}
                    data-menu-item=""
                    data-row="back"
                    onClick={() => goTo("main")}
                    role="menuitem"
                    tabIndex={-1}
                    type="button"
                  >
                    <ChevronLeft className="size-4 text-zinc-400" />
                    <span className="sr-only">Back to </span>
                    Switch Account
                  </button>
                  <Separator />
                  {accounts.map((entry, index) => {
                    const checked = entry.id === account.id;
                    return (
                      <button
                        aria-checked={checked}
                        className={ITEM_CLASS}
                        data-menu-item=""
                        data-row={`account-${entry.id}`}
                        key={entry.id}
                        onClick={() => {
                          if (!checked) {
                            setAccountId(entry.id);
                            onAccountChange?.(entry);
                          }
                          goTo("main");
                        }}
                        role="menuitemradio"
                        tabIndex={-1}
                        type="button"
                      >
                        <Avatar
                          account={entry}
                          className="size-7"
                          status={checked ? status : undefined}
                          tone={index}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-white font-medium">
                            {entry.name}
                          </span>
                          <span className="truncate text-[11px] text-zinc-400 font-mono">
                            {entry.email}
                          </span>
                        </span>
                        {checked ? (
                          <Check className="size-4 text-[#00D632]" />
                        ) : null}
                      </button>
                    );
                  })}
                  <Separator />
                  <button
                    className={ITEM_CLASS}
                    data-menu-item=""
                    data-row="add"
                    onClick={(event) => select(event, onAddAccount)}
                    role="menuitem"
                    tabIndex={-1}
                    type="button"
                  >
                    <span className="grid size-7 place-items-center rounded-lg border border-dashed border-white/20 text-zinc-400">
                      <Plus className="size-3.5" />
                    </span>
                    Add Bank Account
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
