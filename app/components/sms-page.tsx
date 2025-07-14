"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SMSAutoResponsesPanel } from "./panels/sms-auto-responses-panel"

interface SMSPageProps {
  onOpenPanel: (panel: string | null) => void
}

export default function SMSPage({ onOpenPanel }: SMSPageProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const tabs = ["Instructions", "Call", "SMS"]
  const [activeTab, setActiveTab] = useState("SMS")

  const handleOpenPanel = (panelType: string) => {
    setActivePanel(panelType)
    onOpenPanel(panelType)
  }

  const handleClosePanel = () => {
    setActivePanel(null)
    onOpenPanel(null)
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-black text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => handleOpenPanel("sms-auto-responses")}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">SMS Auto Responses</h3>
                <p className="text-gray-600">Set up automated text responses for incoming SMS messages</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">Need extra help? Text Kevin at</p>
          <a href="tel:(628) 266-4233" className="text-blue-600 hover:text-blue-700">
            (628) 266-4233
          </a>
        </div>

        <div className="mt-8 flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <SMSAutoResponsesPanel isOpen={activePanel === "sms-auto-responses"} onClose={handleClosePanel} />
    </>
  )
}
