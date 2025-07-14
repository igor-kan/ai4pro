"use client"

import { X, Plus, Globe, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KnowledgePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function KnowledgePanel({ isOpen, onClose }: KnowledgePanelProps) {
  const sampleFAQs = [
    {
      question: "What types of software development services does Igor Kan offer?",
      answer:
        "Igor Kan specializes in custom software development, mobile app development, and web application development tailored to meet specific business needs.",
    },
    {
      question: "How does Igor Kan ensure the quality of the software developed?",
      answer:
        "Igor Kan follows industry best practices, including agile methodologies, continuous integration, and rigorous testing to ensure high-quality software...",
    },
    {
      question: "What is the typical timeline for a software development project with Igor Kan?",
      answer:
        "The timeline varies depending on the project scope and complexity, but typically ranges from a few weeks to several months. A detailed timeline is provided afte...",
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Knowledge</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs</h3>
          <p className="text-blue-600 text-sm mb-6">Add your first FAQ using the options below.</p>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Add a new FAQ
          </Button>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Learn from my website</span>
            </div>
          </div>
          <p className="text-blue-600 text-sm mb-6">or select suggestion</p>

          <div className="space-y-4">
            {sampleFAQs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
