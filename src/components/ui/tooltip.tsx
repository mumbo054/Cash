import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined)

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div
        className={cn("relative inline-flex", className)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

export function TooltipTrigger({
  asChild,
  render,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
  render?: any
}) {
  if (render && React.isValidElement(render)) {
    return React.cloneElement(render as React.ReactElement<any>, {
      ...(render.props || {}),
      tabIndex: 0,
    })
  }

  return (
    <div tabIndex={0} role="button" className="inline-flex" {...props}>
      {children}
    </div>
  )
}

export function TooltipContent({
  className,
  side = "top",
  align = "center",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end" | string
  hidden?: boolean
}) {
  const context = React.useContext(TooltipContext)
  if (!context?.open || props.hidden) return null

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-50 overflow-hidden rounded-md border border-white/10 bg-zinc-950/90 px-3 py-1.5 text-xs text-zinc-100 shadow-md backdrop-blur-md animate-in fade-in-0 zoom-in-95 whitespace-nowrap",
        positions[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
