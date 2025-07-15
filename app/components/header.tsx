"use client"

import { X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  currentPage?: string
  onPageChange?: (page: string) => void
}

export function Header({ currentPage, onPageChange }: HeaderProps) {
  const showTabs = currentPage === "instructions" || currentPage === "call" || currentPage === "sms"
  const tabs = ["Instructions", "Call", "SMS"]

  return (
    <div className="relative backdrop-blur-xl bg-white/20 border-b border-white/30 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
      
      <div className="relative bg-gradient-to-r from-blue-50/80 to-blue-100/80 backdrop-blur-md border-b border-blue-200/30 px-6 py-3 flex items-center justify-between">
        <p className="text-blue-700 text-sm font-medium">
          Start a free trial to claim your AI-powered number and unlock all our features!
        </p>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Your AI Agent</h1>
        <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-gray-700 hover:bg-white/30">
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
                className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ease-out backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 ${
                  currentPage === tab.toLowerCase() 
                    ? "bg-gradient-to-r from-gray-800/80 to-gray-900/80 text-white border-gray-700/30 shadow-gray-800/25" 
                    : "text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20 border-white/20"
                }`}
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
