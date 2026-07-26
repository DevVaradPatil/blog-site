import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Focus is a border-colour change plus a soft halo that hugs the edge — not an
 * offset ring, which drew a background-coloured gap between the border and the
 * ring and read as two stacked borders.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // `form-field` carries the focus treatment — see globals.css.
          "form-field",
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
          "transition-[color,background-color,border-color,box-shadow] duration-150",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
