import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const ToggleSwitch = React.forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ checked, onCheckedChange, className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-4',
      md: 'w-10 h-5',
      lg: 'w-12 h-6'
    }

    const thumbSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4', 
      lg: 'w-5 h-5'
    }

    const translateClasses = {
      sm: checked ? 'translate-x-4' : 'translate-x-0.5',
      md: checked ? 'translate-x-5' : 'translate-x-0.5',
      lg: checked ? 'translate-x-6' : 'translate-x-0.5'
    }

    return (
      <button
        ref={ref}
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          sizeClasses[size],
          checked 
            ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25" 
            : "bg-gray-300 dark:bg-gray-600",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow-lg transition-transform duration-300 ease-out",
            thumbSizeClasses[size],
            translateClasses[size]
          )}
        />
      </button>
    )
  }
)

ToggleSwitch.displayName = "ToggleSwitch"

export { ToggleSwitch } 