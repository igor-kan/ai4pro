"use client"

import { useState } from "react"
import { Bot, MessageSquare, Phone, Command, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const menuItems = [
    { id: "instructions", icon: Bot, label: "Inbound AI" },
    { id: "threads", icon: MessageSquare, label: "Threads" },
    { id: "dialer", icon: Phone, label: "Dialer" },
    { id: "mission-control", icon: Command, label: "Mission Control" },
    { id: "account", icon: Settings, label: "Account" },
  ]

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col py-6 transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-20",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="mb-8 px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-12"></div>
          </div>
          {isExpanded && <span className="text-xl font-semibold text-gray-900 whitespace-nowrap">Breezy</span>}
        </div>
      </div>

      <nav className="flex flex-col space-y-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-colors text-left w-full",
              currentPage === item.id
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50",
            )}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            {isExpanded && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
