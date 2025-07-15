import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-2xl border px-3 py-1 text-xs font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md shadow-lg",
  {
    variants: {
      variant: {
        default:
          "border-blue-300/30 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 shadow-blue-500/25",
        secondary:
          "border-gray-300/30 bg-gradient-to-r from-gray-100/20 to-gray-200/20 text-gray-700 shadow-gray-500/10",
        destructive:
          "border-red-300/30 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 shadow-red-500/25",
        outline: 
          "border-white/30 bg-white/10 text-gray-700 shadow-black/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
