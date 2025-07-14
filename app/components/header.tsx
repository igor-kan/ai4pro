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
    <div className="bg-white border-b border-gray-200">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between">
        <p className="text-blue-700 text-sm">
          Start a free trial to claim your AI-powered number and unlock all our features!
        </p>
        <Button variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Your AI Agent</h1>
        <Button variant="outline" size="sm">
          <Lock className="w-4 h-4 mr-2" />
        </Button>
      </div>

      {showTabs && onPageChange && (
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onPageChange(tab.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentPage === tab.toLowerCase() ? "bg-black text-white" : "text-gray-600 hover:text-gray-900"
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
