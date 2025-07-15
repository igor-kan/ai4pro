"use client"

import { X, Plus, HelpCircle, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "../../context/theme-context"
import { cn } from "@/lib/utils"

interface KnowledgePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function KnowledgePanel({ isOpen, onClose }: KnowledgePanelProps) {
  const { theme, uiStyle } = useTheme()
  const isGlass = uiStyle === 'glass'
  const isDark = theme === 'dark'

  if (!isOpen) return null

  const sampleFAQs = [
    {
      question: "What are your business hours?",
      answer: "We're open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM."
    },
    {
      question: "How can I schedule an appointment?",
      answer: "You can schedule an appointment by calling us or using our online booking system."
    },
    {
      question: "What services do you offer?",
      answer: "We offer a full range of professional services including consultation, implementation, and ongoing support."
    }
  ]

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full w-96 shadow-xl z-50 overflow-y-auto transition-all duration-300",
      isGlass
        ? cn(
            "backdrop-blur-xl border-l",
            isDark
              ? "bg-gray-900/80 border-gray-700/30"
              : "bg-white/80 border-white/30"
          )
        : cn(
            isDark
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          )
    )}>
      <div className={cn(
        "p-6 border-b transition-all duration-300",
        isGlass
          ? cn(
              "backdrop-blur-sm",
              isDark
                ? "border-gray-700/30 bg-gray-800/20"
                : "border-gray-200/30 bg-white/20"
            )
          : cn(
              isDark
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            )
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isGlass
                ? cn(
                    "backdrop-blur-sm shadow-lg",
                    isDark
                      ? "bg-blue-600/30 text-blue-300"
                      : "bg-blue-500/20 text-blue-600"
                  )
                : cn(
                    isDark
                      ? "bg-blue-600 text-blue-200"
                      : "bg-blue-100 text-blue-600"
                  )
            )}>
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className={cn(
              "text-lg font-semibold transition-colors duration-300",
              isDark ? "text-gray-100" : "text-gray-900"
            )}>
              Knowledge
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className={cn(
              "transition-all duration-300",
              isGlass
                ? cn(
                    "backdrop-blur-sm hover:backdrop-blur-md rounded-lg",
                    isDark
                      ? "hover:bg-gray-700/30 text-gray-300"
                      : "hover:bg-gray-200/30 text-gray-600"
                  )
                : cn(
                    isDark
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  )
            )}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center py-8">
          <h3 className={cn(
            "text-lg font-medium mb-2 transition-colors duration-300",
            isDark ? "text-gray-100" : "text-gray-900"
          )}>
            No FAQs
          </h3>
          <p className={cn(
            "text-sm mb-6 transition-colors duration-300",
            isDark ? "text-blue-400" : "text-blue-600"
          )}>
            Add your first FAQ using the options below.
          </p>

          <Button className={cn(
            "mb-4 transition-all duration-300",
            isGlass
              ? cn(
                  "backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02]",
                  isDark
                    ? "bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white border-blue-500/30"
                    : "bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white border-blue-400/30"
                )
              : cn(
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )
          )}>
            <Plus className="w-4 h-4 mr-2" />
            Add a new FAQ
          </Button>
        </div>

        <div className={cn(
          "border-t pt-6 transition-all duration-300",
          isGlass
            ? cn(
                "border-gray-200/30",
                isDark ? "border-gray-700/30" : ""
              )
            : cn(
                isDark ? "border-gray-700" : "border-gray-200"
              )
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isGlass
                  ? cn(
                      "backdrop-blur-sm",
                      isDark
                        ? "bg-gray-700/30 text-gray-300"
                        : "bg-gray-200/30 text-gray-600"
                    )
                  : cn(
                      isDark
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                    )
              )}>
                <Globe className="w-5 h-5" />
              </div>
              <span className={cn(
                "font-medium transition-colors duration-300",
                isDark ? "text-gray-100" : "text-gray-900"
              )}>
                Learn from my website
              </span>
            </div>
          </div>
          <p className={cn(
            "text-sm mb-6 transition-colors duration-300",
            isDark ? "text-blue-400" : "text-blue-600"
          )}>
            or select suggestion
          </p>

          <div className="space-y-4">
            {sampleFAQs.map((faq, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-4 rounded-lg transition-all duration-300 cursor-pointer",
                  isGlass
                    ? cn(
                        "backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.01]",
                        isDark
                          ? "bg-gray-800/20 border-gray-600/30 hover:bg-gray-700/30"
                          : "bg-white/20 border-white/30 hover:bg-white/30"
                      )
                    : cn(
                        "border hover:shadow-sm",
                        isDark
                          ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      )
                )}
              >
                <h4 className={cn(
                  "font-medium mb-2 transition-colors duration-300",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}>
                  {faq.question}
                </h4>
                <p className={cn(
                  "text-sm transition-colors duration-300",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
