import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
  value: string | null
  onValueChange: (val: string | null) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

export interface SelectProps {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (val: string | null) => void
  items?: Array<{ label: string; value: string | null }>
  children: React.ReactNode
}

export function Select({
  value,
  defaultValue = null,
  onValueChange,
  children,
}: SelectProps) {
  const [internalVal, setInternalVal] = React.useState<string | null>(defaultValue)
  const [open, setOpen] = React.useState(false)
  const isControlled = value !== undefined
  const currentVal = isControlled ? value : internalVal

  const handleValChange = (val: string | null) => {
    if (!isControlled) setInternalVal(val)
    onValueChange?.(val)
    setOpen(false)
  }

  const selectRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <SelectContext.Provider
      value={{
        value: currentVal,
        onValueChange: handleValChange,
        open,
        setOpen,
      }}
    >
      <div ref={selectRef} className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  id,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectContext)
  return (
    <button
      id={id}
      type="button"
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-xl border border-white/15 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-100 shadow-sm backdrop-blur-md transition-colors hover:bg-zinc-800/80 focus:outline-none focus:ring-1 focus:ring-cash-green/50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 text-zinc-400 opacity-70" />
    </button>
  )
}

export function SelectValue({ placeholder = "Select..." }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  return (
    <span className={cn("truncate", !ctx?.value && "text-zinc-500")}>
      {ctx?.value || placeholder}
    </span>
  )
}

export function SelectContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext)
  if (!ctx?.open) return null

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-white/15 bg-zinc-950/95 p-1 text-xs text-zinc-100 shadow-xl backdrop-blur-2xl animate-in fade-in-80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-0.5", className)} {...props}>{children}</div>
}

export function SelectItem({
  value,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string | null }) {
  const ctx = React.useContext(SelectContext)
  const isSelected = ctx?.value === value

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        "cursor-pointer select-none rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-white/10 hover:text-white",
        isSelected && "bg-cash-green/20 text-cash-green font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
