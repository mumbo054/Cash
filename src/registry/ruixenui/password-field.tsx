import * as React from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PasswordFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
  containerClassName?: string
}

interface StrengthCriteria {
  label: string
  valid: boolean
}

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      className,
      containerClassName,
      showStrength = false,
      value = "",
      onChange,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const currentVal = typeof value === "string" ? value : ""

    const criteria: StrengthCriteria[] = React.useMemo(() => {
      return [
        { label: "At least 8 characters", valid: currentVal.length >= 8 },
        {
          label: "Contains lowercase & uppercase",
          valid: /[a-z]/.test(currentVal) && /[A-Z]/.test(currentVal),
        },
        { label: "Contains at least one number", valid: /\d/.test(currentVal) },
        {
          label: "Contains a special character",
          valid: /[!@#$%^&*(),.?":{}|<>]/.test(currentVal),
        },
      ]
    }, [currentVal])

    const strengthScore = React.useMemo(() => {
      return criteria.filter((c) => c.valid).length
    }, [criteria])

    const getStrengthColor = (score: number) => {
      if (score === 0) return "bg-zinc-800"
      if (score === 1) return "bg-rose-500"
      if (score === 2) return "bg-amber-500"
      if (score === 3) return "bg-emerald-400"
      return "bg-[#00D632]" // Cash App signature green
    }

    const getStrengthLabel = (score: number) => {
      if (!currentVal) return ""
      if (score <= 1) return "Weak"
      if (score === 2) return "Fair"
      if (score === 3) return "Good"
      return "Strong"
    }

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        <div className="relative">
          <input
            type={isVisible ? "text" : "password"}
            ref={ref}
            value={value}
            onChange={onChange}
            className={cn(
              "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 pr-11 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-md transition-all focus-visible:outline-none focus-visible:border-[#00D632] focus-visible:bg-white/[0.07] focus-visible:ring-1 focus-visible:ring-[#00D632]/50 disabled:cursor-not-allowed disabled:opacity-50 font-sans",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5 focus:outline-none"
            tabIndex={-1}
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4 text-zinc-400" />
            ) : (
              <Eye className="h-4 w-4 text-zinc-400" />
            )}
          </button>
        </div>

        {/* Real-time Password Strength Meter (only when showStrength is true) */}
        {showStrength && currentVal.length > 0 && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-200">
            {/* Strength segmented progress bars */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    strengthScore >= step
                      ? getStrengthColor(strengthScore)
                      : "bg-white/10"
                  )}
                />
              ))}
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 ml-2 min-w-[48px] text-right font-semibold">
                {getStrengthLabel(strengthScore)}
              </span>
            </div>

            {/* Validation Criteria Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {criteria.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-sans"
                >
                  {item.valid ? (
                    <Check className="h-3 w-3 text-[#00D632] shrink-0 stroke-[3]" />
                  ) : (
                    <X className="h-3 w-3 text-zinc-600 shrink-0 stroke-[2]" />
                  )}
                  <span
                    className={cn(
                      "transition-colors",
                      item.valid ? "text-zinc-200 font-medium" : "text-zinc-500"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

PasswordField.displayName = "PasswordField"

export default PasswordField
export { PasswordField }
