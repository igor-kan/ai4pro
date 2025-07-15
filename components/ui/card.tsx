import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative text-card-foreground overflow-hidden transition-all duration-300",
      // Glass UI styles
      "glass-ui:rounded-3xl glass-ui:border glass-ui:border-white/30 glass-ui:bg-white/20 glass-ui:backdrop-blur-xl glass-ui:shadow-2xl",
      "glass-ui:before:absolute glass-ui:before:inset-0 glass-ui:before:bg-gradient-to-br glass-ui:before:from-white/20 glass-ui:before:to-transparent glass-ui:before:pointer-events-none",
      // Glass dark theme
      "glass-ui:dark:border-gray-700/30 glass-ui:dark:bg-gray-800/20 glass-ui:dark:before:from-gray-700/20",
      // Ordinary UI styles
      "rounded-lg border bg-card shadow-sm",
      "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "relative flex flex-col space-y-1.5 p-6 pb-4 transition-all duration-300",
      // Glass UI styles
      "glass-ui:backdrop-blur-sm",
      "glass-ui:after:absolute glass-ui:after:bottom-0 glass-ui:after:left-6 glass-ui:after:right-6 glass-ui:after:h-px glass-ui:after:bg-gradient-to-r glass-ui:after:from-transparent glass-ui:after:via-white/30 glass-ui:after:to-transparent",
      "glass-ui:dark:after:via-gray-600/30",
      // Ordinary UI styles
      "border-b border-gray-200 dark:border-gray-700",
      className
    )} 
    {...props} 
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight transition-colors duration-300",
      "text-gray-800 dark:text-gray-100",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm transition-colors duration-300",
      "text-gray-600 dark:text-gray-400",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-4 relative", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "relative flex items-center p-6 pt-4 transition-all duration-300",
      // Glass UI styles
      "glass-ui:backdrop-blur-sm",
      "glass-ui:before:absolute glass-ui:before:top-0 glass-ui:before:left-6 glass-ui:before:right-6 glass-ui:before:h-px glass-ui:before:bg-gradient-to-r glass-ui:before:from-transparent glass-ui:before:via-white/30 glass-ui:before:to-transparent",
      "glass-ui:dark:before:via-gray-600/30",
      // Ordinary UI styles
      "border-t border-gray-200 dark:border-gray-700",
      className
    )} 
    {...props} 
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
