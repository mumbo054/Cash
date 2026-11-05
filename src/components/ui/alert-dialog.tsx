import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AlertDialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(null)

export function AlertDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : internalOpen

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <AlertDialogContext.Provider value={{ open: currentOpen, setOpen: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogTrigger({
  asChild,
  render,
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  render?: React.ReactElement<any>
}) {
  const ctx = React.useContext(AlertDialogContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    ctx?.setOpen(true)
  }

  if (render && React.isValidElement(render)) {
    return React.cloneElement(render, {
      ...((render.props as any) || {}),
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        (render.props as any)?.onClick?.(e)
        ctx?.setOpen(true)
      },
    })
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

export function AlertDialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(AlertDialogContext)
  if (!ctx?.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[4px] animate-in fade-in-0 duration-200"
        onClick={() => ctx.setOpen(false)}
      />
      {/* Dialog Window */}
      <div
        className={cn(
          "relative z-50 w-full max-w-md rounded-3xl border border-white/20 bg-zinc-950/90 p-6 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.22)] backdrop-blur-2xl animate-in zoom-in-95 duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export function AlertDialogHeader({
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

export function AlertDialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight text-white", className)}
      {...props}
    />
  )
}

export function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-zinc-400 leading-relaxed", className)}
      {...props}
    />
  )
}

export function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

export function AlertDialogCancel({
  className,
  onClick,
  children = "Cancel",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(AlertDialogContext)
  return (
    <Button
      variant="outline"
      type="button"
      className={cn("rounded-xl border-white/10 hover:bg-white/5", className)}
      onClick={(e) => {
        onClick?.(e)
        ctx?.setOpen(false)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export function AlertDialogAction({
  className,
  onClick,
  children = "Continue",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(AlertDialogContext)
  return (
    <Button
      type="button"
      className={cn(
        "rounded-xl bg-cash-green font-semibold text-black hover:bg-cash-green/90",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        ctx?.setOpen(false)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
