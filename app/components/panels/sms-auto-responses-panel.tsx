"use client"

import { X, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface SMSAutoResponsesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SMSAutoResponsesPanel({ isOpen, onClose }: SMSAutoResponsesPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">SMS Auto Responses</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">SMS Configuration</h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Reply Mode</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Disabled</span>
                <Switch />
              </div>
            </div>
            <p className="text-sm text-gray-600">Choose between auto reply or disabled</p>
          </div>
        </div>
      </div>
    </div>
  )
}
