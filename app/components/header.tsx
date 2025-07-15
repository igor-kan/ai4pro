/**
 * Header Component
 * 
 * The main application header that provides:
 * - Dynamic page titles and context
 * - Tab navigation for related pages (Instructions, Call, SMS)
 * - Theme-aware styling with glassmorphism effects
 * - Premium feature indicators and upgrade prompts
 * - Responsive layout with proper visual hierarchy
 * 
 * Features:
 * - Glass UI: Glassmorphism with backdrop blur and gradient overlays
 * - Ordinary UI: Clean solid backgrounds with borders
 * - Conditional tab display based on current page
 * - Premium feature lock indicators
 * - Smooth theme transitions
 */

"use client"

import { X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "../context/theme-context"
import { cn } from "@/lib/utils"

/**
 * Header Props Interface
 */
interface HeaderProps {
  currentPage?: string                          // Current active page identifier
  onPageChange?: (page: string) => void        // Callback for tab navigation
}

/**
 * Header Component
 * 
 * Renders the application header with theme-aware styling and conditional navigation.
 * Shows tab navigation for related pages and provides visual context for the current section.
 * 
 * @param currentPage - The currently active page
 * @param onPageChange - Function to handle tab navigation
 */
export function Header({ currentPage, onPageChange }: HeaderProps) {
  // Theme context for styling
  const { theme, uiStyle } = useTheme()
  
  // Show tab navigation only for core communication pages
  const showTabs = currentPage === "instructions" || currentPage === "call" || currentPage === "sms"
  const tabs = ["Instructions", "Call", "SMS"]

  // Theme state helpers
  const isGlass = uiStyle === 'glass'
  const isDark = theme === 'dark'

  return (
    <div className={cn(
      "relative border-b transition-all duration-300",
      isGlass
        ? cn(
            "backdrop-blur-xl shadow-xl",
            isDark
              ? "bg-gray-800/20 border-gray-700/30"
              : "bg-white/20 border-white/30"
          )
        : cn(
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          )
    )}>
      {/* Glass UI gradient overlay */}
      {isGlass && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none dark:from-gray-700/10"></div>
      )}
      
      {/* Main header content with premium styling */}
      <div className={cn(
        "relative px-6 py-3 flex items-center justify-between",
        isGlass
          ? cn(
              "backdrop-blur-md border-b",
              isDark
                ? "bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-blue-700/30"
                : "bg-gradient-to-r from-blue-50/80 to-blue-100/80 border-blue-200/30"
            )
          : cn(
              "border-b",
              isDark
                ? "bg-blue-900 border-blue-800"
                : "bg-blue-50 border-blue-100"
            )
      )}>
        <p className={cn(
          "text-sm font-medium",
          isDark ? "text-blue-300" : "text-blue-700"
        )}>
          Start a free trial to claim your AI-powered number and unlock all our features!
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            isDark
              ? "text-blue-300 hover:text-blue-200"
              : "text-blue-600 hover:text-blue-700",
            isGlass
              ? "hover:bg-blue-100/50 dark:hover:bg-blue-800/30"
              : "hover:bg-blue-100 dark:hover:bg-blue-800"
          )}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative px-6 py-4 flex items-center justify-between">
        <h1 className={cn(
          "text-xl font-semibold",
          isDark ? "text-gray-100" : "text-gray-800"
        )}>
          Your AI Agent
        </h1>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            isGlass
              ? cn(
                  "bg-white/20 border-white/30 hover:bg-white/30",
                  isDark
                    ? "bg-gray-700/20 border-gray-600/30 text-gray-200 hover:bg-gray-600/30"
                    : "text-gray-700"
                )
              : cn(
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )
          )}
        >
          <Lock className="w-4 h-4 mr-2" />
        </Button>
      </div>

      {showTabs && onPageChange && (
        <div className="relative px-6 pb-4">
          <div className="flex items-center space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onPageChange(tab.toLowerCase())}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-all duration-300 ease-out",
                  isGlass
                    ? cn(
                        "rounded-2xl backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5",
                        currentPage === tab.toLowerCase()
                          ? isDark
                            ? "bg-gradient-to-r from-gray-700/80 to-gray-800/80 text-gray-100 border-gray-600/30 shadow-gray-700/25"
                            : "bg-gradient-to-r from-gray-800/80 to-gray-900/80 text-white border-gray-700/30 shadow-gray-800/25"
                          : isDark
                            ? "text-gray-300 hover:text-gray-100 bg-gray-800/20 hover:bg-gray-700/30 border-gray-600/20"
                            : "text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20 border-white/20"
                      )
                    : cn(
                        "rounded-lg",
                        currentPage === tab.toLowerCase()
                          ? isDark
                            ? "bg-gray-700 text-gray-100"
                            : "bg-black text-white"
                          : isDark
                            ? "text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Header
