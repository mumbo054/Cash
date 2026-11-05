import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextType | null>(null)

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : internalOpen
  const handleOpenChange = onOpenChange ?? setInternalOpen

  return (
    <SheetContext.Provider value={{ open: currentOpen, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

export function SheetTrigger({
  asChild,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(SheetContext)
  return (
    <button
      type="button"
      onClick={() => ctx?.onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  )
}

export function SheetContent({
  side = "left",
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
}) {
  const ctx = React.useContext(SheetContext)
  if (!ctx?.open) return null

  const sideAnimations = {
    left: "inset-y-0 left-0 border-r animate-in slide-in-from-left",
    right: "inset-y-0 right-0 border-l animate-in slide-in-from-right",
    top: "inset-x-0 top-0 border-b animate-in slide-in-from-top",
    bottom: "inset-x-0 bottom-0 border-t animate-in slide-in-from-bottom",
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => ctx.onOpenChange(false)}
      />
      {/* Sliding Sheet */}
      <div
        className={cn(
          "fixed z-50 gap-4 border-white/10 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl transition ease-in-out duration-300",
          sideAnimations[side],
          className
        )}
        style={style}
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={() => ctx.onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4 text-zinc-400" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold text-zinc-100", className)}
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-zinc-400", className)}
      {...props}
    />
  )
}
