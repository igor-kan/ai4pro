"use client"

import { useState } from "react"
import { Mic, Bell, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoiceModal } from "./voice-modal"
import { NotificationPreferencesPanel } from "./panels/notification-preferences-panel"
import PremiumButton from "@/components/ui/premium-button"

interface CallPageProps {
  onOpenPanel: (panel: string | null) => void
}

export default function CallPage({ onOpenPanel }: CallPageProps) {
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const handleOpenPanel = (panelType: string) => {
    setActivePanel(panelType)
    onOpenPanel(panelType)
  }

  const handleClosePanel = () => {
    setActivePanel(null)
    onOpenPanel(null)
  }

  const callSettings = [
    {
      icon: Mic,
      title: "Voice",
      description: "Select the voice for your virtual receptionist",
      onClick: () => setShowVoiceModal(true),
    },
    {
      icon: Bell,
      title: "Notification Preferences",
      description: "Choose how and when to receive summaries and transcripts",
      onClick: () => handleOpenPanel("notification-preferences"),
    },
    {
      icon: Phone,
      title: "Call Recordings",
      description: "Enable call recording and manage recording preferences",
    },
  ]

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Start Taking Calls</h2>
        </div>

        <div className="space-y-6">
          {callSettings.map((setting, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={setting.onClick}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <setting.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{setting.title}</h3>
                  <p className="text-gray-600">{setting.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">Need extra help? Text Kevin at</p>
          <a href="tel:(628) 266-4233" className="text-blue-600 hover:text-blue-700">
            (628) 266-4233
          </a>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <PremiumButton
            feature="callTranscription"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
          >
            <Phone className="w-4 h-4 mr-2" />
            Preview Call Handling
          </PremiumButton>
          
          <PremiumButton
            feature="aiReceptionist"
            variant="outline"
            className="px-8 py-3 rounded-full"
          >
            <Mic className="w-4 h-4 mr-2" />
            Test AI Receptionist
          </PremiumButton>
        </div>
      </div>

      <VoiceModal open={showVoiceModal} onOpenChange={setShowVoiceModal} />
      <NotificationPreferencesPanel isOpen={activePanel === "notification-preferences"} onClose={handleClosePanel} />
    </>
  )
}
