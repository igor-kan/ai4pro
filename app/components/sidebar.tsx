"use client"

import { useState } from "react"
import { Bot, MessageSquare, Phone, Command, Settings, HelpCircle, Megaphone, Zap, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  return (
    <div
      className={cn(
        "relative backdrop-blur-xl bg-white/20 border-r border-white/30 flex flex-col py-6 transition-all duration-500 ease-out shadow-2xl",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none",
        isExpanded ? "w-64" : "w-20",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="mb-8 px-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl backdrop-blur-md shadow-lg"></div>
            <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-sm transform rotate-12 shadow-sm"></div>
            </div>
          </div>
          {isExpanded && (
            <span className="text-xl font-semibold text-gray-800 whitespace-nowrap transition-all duration-300 ease-out">
              Breezy
            </span>
          )}
        </div>
      </div>

      <nav className="flex flex-col space-y-2 px-3 relative z-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              "group relative flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 ease-out text-left w-full overflow-hidden",
              "backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300",
              "hover:before:opacity-100 hover:scale-[1.02] hover:-translate-y-0.5",
              currentPage === item.id
                ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-blue-300/30 shadow-blue-500/25"
                : "text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20",
            )}
          >
            <div className="relative z-10 flex items-center space-x-3 w-full">
              <div className={cn(
                "p-2 rounded-xl backdrop-blur-sm transition-all duration-300",
                currentPage === item.id
                  ? "bg-blue-500/20 text-blue-600"
                  : "bg-white/20 text-gray-600 group-hover:bg-white/30 group-hover:text-gray-700"
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
    </div>
  )
}

export default Sidebar
