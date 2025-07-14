"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Calendar,
  HelpCircle,
  Users,
  Lock,
  FileText,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CallerDetailsModal } from "./caller-details-modal"
import { KnowledgePanel } from "./panels/knowledge-panel"
import { NotificationPreferencesPanel } from "./panels/notification-preferences-panel"

interface InstructionsPageProps {
  onOpenPanel: (panel: string | null) => void
}

const InstructionsPage = ({ onOpenPanel }: InstructionsPageProps) => {
  const [showCallerDetails, setShowCallerDetails] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const handleOpenPanel = (panelType: string) => {
    setActivePanel(panelType)
    onOpenPanel(panelType)
  }

  const handleClosePanel = () => {
    setActivePanel(null)
    onOpenPanel(null)
  }

  const greetingSection = {
    icon: MessageCircle,
    title: "Greeting & Farewell",
    description: "Set up how your AI greets callers and ends conversations",
  }

  const coreCapabilities = [
    {
      icon: MessageSquare,
      title: "Take Messages",
      description: "Collects caller details and message content",
      status: "Enabled",
      statusColor: "bg-green-100 text-green-800",
      onClick: () => setShowCallerDetails(true),
    },
    {
      icon: Calendar,
      title: "Schedule Appointments",
      description: "Checks calendar and books meetings",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
    },
    {
      icon: HelpCircle,
      title: "Answer FAQs",
      description: "Responds to common questions",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
      onClick: () => handleOpenPanel("knowledge"),
    },
    {
      icon: Users,
      title: "Qualify Leads",
      description: "Asks screening questions for prospects",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
    },
    {
      icon: Lock,
      title: "Transfer Calls",
      description: "Routes calls to specific people",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
    },
    {
      icon: MessageSquare,
      title: "Send Follow-up Texts",
      description: "Send automated text messages after calls",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
    },
  ]

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" />
            All Instructions
          </button>
        </div>

        {/* Greeting & Farewell Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <greetingSection.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{greetingSection.title}</h3>
                  <p className="text-gray-600 text-sm">{greetingSection.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Core Capabilities Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Core Capabilities</h2>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {coreCapabilities.map((capability, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={capability.onClick}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <capability.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{capability.title}</h3>
                      <p className="text-gray-600 text-sm">{capability.description}</p>
                    </div>
                  </div>
                  <Badge className={capability.statusColor}>{capability.status}</Badge>
                </div>
              </div>
            ))}
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
            <Users className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <CallerDetailsModal open={showCallerDetails} onOpenChange={setShowCallerDetails} />
      <KnowledgePanel isOpen={activePanel === "knowledge"} onClose={handleClosePanel} />
      <NotificationPreferencesPanel isOpen={activePanel === "notification-preferences"} onClose={handleClosePanel} />
    </>
  )
}

export default InstructionsPage
