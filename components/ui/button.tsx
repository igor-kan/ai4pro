/**
 * Button Component
 * 
 * A comprehensive button component with multiple variants and theme-aware styling.
 * Supports both glass (glassmorphism) and ordinary UI modes with different visual treatments.
 * 
 * Features:
 * - Multiple variants: default, destructive, outline, secondary, ghost, link
 * - Size variations: default, sm, lg, icon
 * - Glass UI: Glassmorphism effects with backdrop blur, gradients, and animations
 * - Ordinary UI: Clean solid styling with standard hover effects
 * - Dark/light theme support
 * - Accessibility features with focus rings and keyboard navigation
 * - Slot support for custom rendering (as other elements)
 * - SVG icon handling with consistent sizing
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Variants Configuration
 * 
 * Uses class-variance-authority (cva) to create a flexible variant system.
 * Each variant includes both glass and ordinary UI styling with theme support.
 * 
 * Glass UI Features:
 * - Backdrop blur effects with transparency
 * - Gradient backgrounds and hover effects
 * - Smooth scale and translate animations
 * - Dynamic shadow effects
 * - Overlay gradients for premium feel
 * 
 * Ordinary UI Features:
 * - Solid backgrounds with hover states
 * - Clean borders and focus rings
 * - Standard Material Design-inspired styling
 */
const buttonVariants = cva(
  // Base styles applied to all variants
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /**
         * Default Primary Button Variant
         * Glass: Blue gradient with glassmorphism effects
         * Ordinary: Solid primary color with hover states
         */
        default: cn(
          // Glass UI styles with glassmorphism effects
          "glass-ui:rounded-2xl glass-ui:overflow-hidden glass-ui:backdrop-blur-md glass-ui:border glass-ui:shadow-lg glass-ui:hover:shadow-xl glass-ui:hover:scale-[1.02] glass-ui:hover:-translate-y-0.5",
          "glass-ui:before:absolute glass-ui:before:inset-0 glass-ui:before:bg-gradient-to-r glass-ui:before:from-white/10 glass-ui:before:to-transparent glass-ui:before:opacity-0 glass-ui:before:transition-opacity glass-ui:before:duration-300 glass-ui:hover:before:opacity-100",
          // Glass light theme colors
          "glass-ui:bg-gradient-to-r glass-ui:from-blue-500/80 glass-ui:to-blue-600/80 glass-ui:text-white glass-ui:border-blue-400/30 glass-ui:shadow-blue-500/25 glass-ui:hover:from-blue-600/90 glass-ui:hover:to-blue-700/90",
          // Glass dark theme colors
          "glass-ui:dark:from-blue-600/80 glass-ui:dark:to-blue-700/80 glass-ui:dark:border-blue-500/30 glass-ui:dark:shadow-blue-600/25 glass-ui:dark:hover:from-blue-700/90 glass-ui:dark:hover:to-blue-800/90",
          // Ordinary UI styles (hidden in glass mode)
          "glass-ui:!hidden", // Hide glass styles when not in glass mode
          "rounded-md bg-primary text-primary-foreground hover:bg-primary/90",
          "dark:bg-blue-600 dark:hover:bg-blue-700"
        ),
        /**
         * Destructive Button Variant
         * Glass: Red gradient with warning-style glassmorphism
         * Ordinary: Solid destructive color for dangerous actions
         */
        destructive: cn(
          // Glass UI styles with red theming
          "glass-ui:rounded-2xl glass-ui:overflow-hidden glass-ui:backdrop-blur-md glass-ui:border glass-ui:shadow-lg glass-ui:hover:shadow-xl glass-ui:hover:scale-[1.02] glass-ui:hover:-translate-y-0.5",
          "glass-ui:before:absolute glass-ui:before:inset-0 glass-ui:before:bg-gradient-to-r glass-ui:before:from-white/10 glass-ui:before:to-transparent glass-ui:before:opacity-0 glass-ui:before:transition-opacity glass-ui:before:duration-300 glass-ui:hover:before:opacity-100",
          "glass-ui:bg-gradient-to-r glass-ui:from-red-500/80 glass-ui:to-red-600/80 glass-ui:text-white glass-ui:border-red-400/30 glass-ui:shadow-red-500/25 glass-ui:hover:from-red-600/90 glass-ui:hover:to-red-700/90",
          "glass-ui:dark:from-red-600/80 glass-ui:dark:to-red-700/80 glass-ui:dark:border-red-500/30 glass-ui:dark:shadow-red-600/25",
          // Ordinary UI styles
          "rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90",
          "dark:bg-red-600 dark:hover:bg-red-700"
        ),
        /**
         * Outline Button Variant
         * Glass: Transparent with border and subtle background
         * Ordinary: Border-only styling with hover fill
         */
        outline: cn(
          // Glass UI styles with transparency
          "glass-ui:rounded-2xl glass-ui:backdrop-blur-md glass-ui:border-white/30 glass-ui:bg-white/10 glass-ui:hover:bg-white/20 glass-ui:shadow-black/5",
          "glass-ui:dark:border-gray-600/30 glass-ui:dark:bg-gray-800/20 glass-ui:dark:hover:bg-gray-700/30 glass-ui:dark:text-gray-200",
          // Ordinary UI styles
          "rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
        ),
        secondary: cn(
          // Glass UI styles
          "glass-ui:rounded-2xl glass-ui:backdrop-blur-md glass-ui:border glass-ui:shadow-lg",
          "glass-ui:bg-gradient-to-r glass-ui:from-gray-100/80 glass-ui:to-gray-200/80 glass-ui:text-gray-900 glass-ui:border-gray-300/30 glass-ui:shadow-gray-500/10 glass-ui:hover:from-gray-200/90 glass-ui:hover:to-gray-300/90",
          "glass-ui:dark:from-gray-700/80 glass-ui:dark:to-gray-800/80 glass-ui:dark:text-gray-100 glass-ui:dark:border-gray-600/30",
          // Ordinary UI styles
          "rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80",
          "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        ),
        ghost: cn(
          // Glass UI styles
          "glass-ui:border-transparent glass-ui:bg-transparent glass-ui:hover:bg-white/20 glass-ui:shadow-none",
          "glass-ui:dark:hover:bg-gray-800/30 glass-ui:dark:text-gray-300",
          // Ordinary UI styles
          "rounded-md hover:bg-accent hover:text-accent-foreground",
          "dark:hover:bg-gray-700 dark:text-gray-300"
        ),
        link: cn(
          "text-primary underline-offset-4 hover:underline border-transparent bg-transparent shadow-none",
          "dark:text-blue-400"
        ),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 glass-ui:rounded-xl",
        lg: "h-11 px-8 glass-ui:rounded-2xl",
        icon: "h-10 w-10 glass-ui:rounded-xl",
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
