import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const intervalButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        active: "bg-primary text-primary-foreground",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 rounded-md px-2 text-xs",
        lg: "h-10 rounded-md px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface IntervalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof intervalButtonVariants> {
  isActive?: boolean
  isLoading?: boolean
}

const IntervalButton = React.forwardRef<HTMLButtonElement, IntervalButtonProps>(
  ({ className, variant, size, isActive, isLoading, children, ...props }, ref) => {
    const buttonVariant = isActive ? "active" : "outline"
    
    return (
      <button
        className={cn(intervalButtonVariants({ variant: buttonVariant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          children
        )}
      </button>
    )
  }
)
IntervalButton.displayName = "IntervalButton"

export { IntervalButton, intervalButtonVariants }