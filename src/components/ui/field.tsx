import * as React from "react"
import { cn } from "@/lib/utils"

export function FieldSet({
  className,
  ...props
}: React.FieldsetHTMLAttributes<HTMLFieldSetElement>) {
  return (
    <fieldset
      className={cn("space-y-4 border-none p-0", className)}
      {...props}
    />
  )
}

export function FieldLegend({
  className,
  ...props
}: React.HTMLAttributes<HTMLLegendElement>) {
  return (
    <legend
      className={cn("text-base font-semibold text-zinc-100", className)}
      {...props}
    />
  )
}

export function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3.5", className)} {...props} />
}

export function Field({
  className,
  orientation = "vertical",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal"
}) {
  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "flex items-center gap-3 space-y-0"
          : "space-y-1.5",
        className
      )}
      {...props}
    />
  )
}

export function FieldLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-medium text-zinc-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export function FieldDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[11px] text-zinc-500", className)}
      {...props}
    />
  )
}

export function FieldSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("my-4 border-t border-white/10", className)}
      {...props}
    />
  )
}
