import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white border-blue-400/30 shadow-blue-500/25 hover:from-blue-600/90 hover:to-blue-700/90",
        destructive:
          "bg-gradient-to-r from-red-500/80 to-red-600/80 text-white border-red-400/30 shadow-red-500/25 hover:from-red-600/90 hover:to-red-700/90",
        outline:
          "border-white/30 bg-white/10 text-gray-700 backdrop-blur-md hover:bg-white/20 hover:text-gray-800 shadow-black/5",
        secondary:
          "bg-gradient-to-r from-gray-100/80 to-gray-200/80 text-gray-900 border-gray-300/30 shadow-gray-500/10 hover:from-gray-200/90 hover:to-gray-300/90",
        ghost: 
          "border-transparent bg-transparent text-gray-600 hover:bg-white/20 hover:text-gray-800 shadow-none",
        link: 
          "text-blue-600 underline-offset-4 hover:underline border-transparent bg-transparent shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-2xl px-8",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
