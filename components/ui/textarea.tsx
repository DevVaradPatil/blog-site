import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/** Matches Input's focus treatment — see the note there. */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "form-field",
          "flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
          "transition-[color,background-color,border-color,box-shadow] duration-150",
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
Textarea.displayName = "Textarea"

export { Textarea }
