"use client"

import { useState } from "react"
import { Bot, MessageSquare, Phone, Command, Settings, HelpCircle, Megaphone, Zap, Headphones, Sun, Moon, Sparkles, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "../context/theme-context"
import { ToggleSwitch } from "@/components/ui/toggle-switch"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme, uiStyle, toggleTheme, toggleUIStyle } = useTheme()

  const menuItems = [
    { id: "instructions", icon: Bot, label: "Inbound AI" },
    { id: "ask-breezy", icon: HelpCircle, label: "Ask Breezy" },
    { id: "breezy-ads", icon: Megaphone, label: "Breezy Ads" },
    { id: "breezy-campaigns", icon: Zap, label: "Breezy Campaigns" },
    { id: "call-coach", icon: Headphones, label: "Call Coach" },
    { id: "threads", icon: MessageSquare, label: "Threads" },
    { id: "dialer", icon: Phone, label: "Dialer" },
    { id: "mission-control", icon: Command, label: "Mission Control" },
    { id: "account", icon: Settings, label: "Account" },
  ]

  const isGlass = uiStyle === 'glass'
  const isDark = theme === 'dark'

  const sidebarClasses = cn(
    "relative flex flex-col py-6 transition-all duration-500 ease-out shadow-2xl",
    "before:absolute before:inset-0 before:pointer-events-none",
    isExpanded ? "w-64" : "w-20",
    isGlass 
      ? cn(
          "backdrop-blur-xl border-r shadow-2xl",
          isDark 
            ? "bg-gray-900/20 border-gray-700/30 before:bg-gradient-to-b before:from-gray-800/10 before:to-transparent"
            : "bg-white/20 border-white/30 before:bg-gradient-to-b before:from-white/10 before:to-transparent"
        )
      : cn(
          "border-r",
          isDark 
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        )
  )

  const logoClasses = isGlass 
    ? "w-10 h-10 relative"
    : "w-8 h-8 rounded flex items-center justify-center flex-shrink-0"

  const menuItemClasses = (isActive: boolean) => cn(
    "group relative flex items-center space-x-3 p-3 transition-all duration-300 ease-out text-left w-full overflow-hidden",
    isGlass
      ? cn(
          "rounded-2xl backdrop-blur-md border shadow-lg hover:shadow-xl",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300",
          "hover:before:opacity-100 hover:scale-[1.02] hover:-translate-y-0.5",
          isActive
            ? isDark
              ? "bg-gradient-to-r from-blue-600/30 to-blue-700/30 text-blue-300 border-blue-400/30 shadow-blue-600/25"
              : "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-blue-300/30 shadow-blue-500/25"
            : isDark
              ? "text-gray-300 hover:text-gray-100 bg-gray-800/20 hover:bg-gray-700/30 border-gray-600/20"
              : "text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20 border-white/20"
        )
      : cn(
          "rounded-lg",
          isActive
            ? isDark
              ? "bg-blue-600 text-white"
              : "bg-blue-50 text-blue-600"
            : isDark
              ? "text-gray-300 hover:text-gray-100 hover:bg-gray-800"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        )
  )

  return (
    <div
      className={sidebarClasses}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="mb-8 px-6 relative z-10">
        <div className="flex items-center space-x-3">
          {isGlass ? (
            <div className={logoClasses}>
              <div className={cn(
                "absolute inset-0 rounded-2xl backdrop-blur-md shadow-lg",
                isDark 
                  ? "bg-gradient-to-br from-blue-500 to-blue-700"
                  : "bg-gradient-to-br from-blue-400 to-blue-600"
              )}></div>
              <div className={cn(
                "absolute inset-0 rounded-2xl backdrop-blur-sm",
                isDark ? "bg-gray-800/20" : "bg-white/20"
              )}></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm transform rotate-12 shadow-sm"></div>
              </div>
            </div>
          ) : (
            <div className={cn(
              logoClasses,
              isDark ? "bg-blue-500" : "bg-blue-500"
            )}>
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-12"></div>
            </div>
          )}
          {isExpanded && (
            <span className={cn(
              "text-xl font-semibold whitespace-nowrap transition-all duration-300 ease-out",
              isDark ? "text-gray-100" : "text-gray-800"
            )}>
              Breezy
            </span>
          )}
        </div>
      </div>

      <nav className="flex flex-col space-y-2 px-3 relative z-10 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={menuItemClasses(currentPage === item.id)}
          >
            <div className="relative z-10 flex items-center space-x-3 w-full">
              <div className={cn(
                "p-2 transition-all duration-300",
                isGlass 
                  ? cn(
                      "rounded-xl backdrop-blur-sm",
                      currentPage === item.id
                        ? isDark
                          ? "bg-blue-600/30 text-blue-300"
                          : "bg-blue-500/20 text-blue-600"
                        : isDark
                          ? "bg-gray-700/30 text-gray-300 group-hover:bg-gray-600/40 group-hover:text-gray-200"
                          : "bg-white/20 text-gray-600 group-hover:bg-white/30 group-hover:text-gray-700"
                    )
                  : cn(
                      "rounded",
                      currentPage === item.id
                        ? isDark ? "text-white" : "text-blue-600"
                        : isDark ? "text-gray-300" : "text-gray-400"
                    )
              )}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
              </div>
              {isExpanded && (
                <span className="font-medium whitespace-nowrap transition-all duration-300 ease-out">
                  {item.label}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>

      {/* Toggle Switches */}
      <div className="px-3 relative z-10 mt-4">
        <div className={cn(
          "p-4 transition-all duration-300",
          isGlass
            ? cn(
                "rounded-2xl backdrop-blur-md border shadow-lg",
                isDark
                  ? "bg-gray-800/20 border-gray-600/20"
                  : "bg-white/10 border-white/20"
              )
            : cn(
                "rounded-lg border",
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              )
        )}>
          {/* Theme Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {isDark ? (
                <Moon className={cn("w-4 h-4", isDark ? "text-gray-300" : "text-gray-600")} />
              ) : (
                <Sun className={cn("w-4 h-4", isDark ? "text-gray-300" : "text-gray-600")} />
              )}
              {isExpanded && (
                <span className={cn("text-xs font-medium", isDark ? "text-gray-300" : "text-gray-600")}>
                  {isDark ? 'Dark' : 'Light'}
                </span>
              )}
            </div>
            <ToggleSwitch
              checked={isDark}
              onCheckedChange={toggleTheme}
              size="sm"
            />
          </div>

          {/* UI Style Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isGlass ? (
                <Sparkles className={cn("w-4 h-4", isDark ? "text-gray-300" : "text-gray-600")} />
              ) : (
                <Square className={cn("w-4 h-4", isDark ? "text-gray-300" : "text-gray-600")} />
              )}
              {isExpanded && (
                <span className={cn("text-xs font-medium", isDark ? "text-gray-300" : "text-gray-600")}>
                  {isGlass ? 'Glass' : 'Simple'}
                </span>
              )}
            </div>
            <ToggleSwitch
              checked={isGlass}
              onCheckedChange={toggleUIStyle}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
