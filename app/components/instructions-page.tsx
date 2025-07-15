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
  Bot,
  Phone,
  Shield,
  Send,
  User,
  Star,
  ExternalLink,
  ArrowRight,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CallerDetailsModal } from "./caller-details-modal"
import { KnowledgePanel } from "./panels/knowledge-panel"
import { NotificationPreferencesPanel } from "./panels/notification-preferences-panel"
import PremiumButton from "@/components/ui/premium-button"
import { useSubscription } from "../context/subscription-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface InstructionsPageProps {
  onOpenPanel: (panel: string | null) => void
}

const InstructionsPage = ({ onOpenPanel }: InstructionsPageProps) => {
  const [showCallerDetails, setShowCallerDetails] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [showGreeting, setShowGreeting] = useState(false)
  const [showFarewell, setShowFarewell] = useState(false)
  const [greetingText, setGreetingText] = useState("Hello, you've reached Igor Kan! How can I help you today?")
  const [farewellText, setFarewellText] = useState("Thank you for calling! Have a great day!")
  const [view, setView] = useState("main") // main, greeting-farewell, greeting, farewell
  const { subscription, isActive } = useSubscription()

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
    onClick: () => setView("greeting-farewell")
  }

  const coreCapabilities = [
    {
      icon: MessageSquare,
      title: "Take Messages",
      description: "Collects caller details and message content",
      status: "Enabled",
      statusColor: "bg-green-100 text-green-800",
      onClick: () => setShowCallerDetails(true),
      feature: "basic-ai",
      enabled: true
    },
    {
      icon: Calendar,
      title: "Schedule Appointments",
      description: "Checks calendar and books meetings",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
      feature: "call-transcripts",
      enabled: false
    },
    {
      icon: HelpCircle,
      title: "Answer FAQs",
      description: "Responds to common questions",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
      onClick: () => handleOpenPanel("knowledge"),
      feature: "basic-ai",
      enabled: false
    },
    {
      icon: Users,
      title: "Qualify Leads",
      description: "Asks screening questions for prospects",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
      feature: "advanced-ai",
      enabled: false
    },
    {
      icon: Lock,
      title: "Transfer Calls",
      description: "Routes calls to specific people",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
      feature: "call-transcripts",
      enabled: false
    },
    {
      icon: Send,
      title: "Send Follow-up Texts",
      description: "Send automated text messages after calls",
      status: "Disabled",
      statusColor: "bg-gray-100 text-gray-600",
      feature: "sms-responses",
      enabled: false
    },
  ]

  if (view === "greeting-farewell") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button 
            onClick={() => setView("main")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            All Instructions
          </button>
        </div>

        <div className="space-y-4">
          {/* Greeting Section */}
          <div 
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => setView("greeting")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Greeting</h3>
                  <p className="text-gray-600 text-sm">Set up your AI's greeting message</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Farewell Section */}
          <div 
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => setView("farewell")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Farewell</h3>
                  <p className="text-gray-600 text-sm">Set up your AI's farewell message</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <PremiumButton
            feature="custom-greetings"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
          >
            <User className="w-4 h-4 mr-2" />
            Preview
          </PremiumButton>
        </div>
      </div>
    )
  }

  if (view === "greeting") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button 
            onClick={() => setView("greeting-farewell")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            All Instructions
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Greeting</h2>
            <button 
              className="text-blue-600 hover:text-blue-700 flex items-center"
              onClick={() => setShowGreeting(true)}
            >
              <Star className="w-4 h-4 mr-1" />
              Rewrite
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700">{greetingText}</p>
          </div>

          <div className="flex items-center text-blue-600 text-sm mb-4">
            <Phone className="w-4 h-4 mr-2" />
            This is how your AI will start conversations
          </div>
          
          <p className="text-blue-600 text-sm">
            Make a great first impression with your callers
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <PremiumButton
            feature="custom-greetings"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
          >
            <User className="w-4 h-4 mr-2" />
            Preview
          </PremiumButton>
        </div>
      </div>
    )
  }

  if (view === "farewell") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button 
            onClick={() => setView("greeting-farewell")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            All Instructions
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Farewell</h2>
            <button 
              className="text-blue-600 hover:text-blue-700 flex items-center"
              onClick={() => setShowFarewell(true)}
            >
              <Star className="w-4 h-4 mr-1" />
              Rewrite
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700">{farewellText}</p>
          </div>

          <div className="flex items-center text-blue-600 text-sm mb-4">
            <Phone className="w-4 h-4 mr-2" />
            This is how your AI will end conversations
          </div>
          
          <p className="text-blue-600 text-sm">
            Leave a lasting positive impression
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <PremiumButton
            feature="custom-greetings"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
          >
            <User className="w-4 h-4 mr-2" />
            Preview
          </PremiumButton>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          {/* Tab Navigation */}
          <div className="flex items-center space-x-4 mb-8">
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-black text-white">
              Instructions
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900">
              Call
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900">
              SMS
            </button>
          </div>
        </div>

        {/* Greeting & Farewell Section */}
        <div className="mb-8">
          <div 
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={greetingSection.onClick}
          >
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
                  <div className="flex items-center space-x-2">
                    <Badge className={capability.statusColor}>{capability.status}</Badge>
                    {!capability.enabled && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
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
          <PremiumButton
            feature="basic-ai"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
          >
            <User className="w-4 h-4 mr-2" />
            Preview
          </PremiumButton>
        </div>
      </div>

      <CallerDetailsModal open={showCallerDetails} onOpenChange={setShowCallerDetails} />
      <KnowledgePanel isOpen={activePanel === "knowledge"} onClose={handleClosePanel} />
      <NotificationPreferencesPanel isOpen={activePanel === "notification-preferences"} onClose={handleClosePanel} />
    </>
  )
}

export default InstructionsPage
