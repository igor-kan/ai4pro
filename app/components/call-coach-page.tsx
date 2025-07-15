"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Suggestion {
  id: string
  text: string
  reason: string
  timestamp: number // in seconds
}

export default function CallCoachPage() {
  const [transcript, setTranscript] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null)

  // Mock live transcript and suggestions for demo
  useEffect(() => {
    let transcriptInterval: NodeJS.Timeout
    let suggestionTimeout: NodeJS.Timeout

    const mockTranscript = [
      "Hello, thank you for calling Breezy AI. My name is Breezy. How may I assist you today?",
      "Hi Breezy, I'm calling to inquire about your AI-powered phone number service.",
      "Certainly. Our AI-powered phone number provides an intelligent front desk to handle inbound and outbound calls and text messages.",
      "That sounds interesting. What are the main benefits for a solo service professional like me?",
      "For solo service pros, it means you can grow your business without needing to hire additional headcount for operational work. The AI handles routine inquiries, schedules appointments, and manages communications across the customer lifecycle.",
      "So it frees up my time?",
      "Exactly. It's designed to automate your communication, allowing you to focus on your core services.",
      "And how does pricing work?",
      "We offer various plans tailored to different business needs. Our basic plan starts at $X per month and includes Y minutes and Z texts. We also have a 7-day free trial.",
      "A free trial? That's great! How do I sign up for that?",
      "You can sign up directly on our website. Just look for the 'Start Free Trial' button. It's a quick and easy process to get your AI-powered number.",
      "Perfect. I'll check that out. Thanks, Breezy!",
      "You're very welcome. Is there anything else I can assist you with today?",
      "No, that's all for now. Goodbye!",
      "Thank you for calling Breezy AI. Have a great day!"
    ]

    const mockSuggestions: Suggestion[] = [
      {
        id: "s1",
        text: "Mention the 7-day free trial early!",
        reason: "New prospects are often looking for low-risk ways to try out a service.",
        timestamp: 10, // after 10 seconds of call
      },
      {
        id: "s2",
        text: "Ask about their specific business needs.",
        reason: "Tailoring the conversation to their unique situation increases engagement.",
        timestamp: 30,
      },
      {
        id: "s3",
        text: "Highlight time-saving aspect.",
        reason: "Solo professionals value solutions that free up their time to focus on core work.",
        timestamp: 45,
      },
      {
        id: "s4",
        text: "Provide clear pricing details or direct to pricing page.",
        reason: "Transparency builds trust and helps the prospect make an informed decision.",
        timestamp: 60,
      },
      {
        id: "s5",
        text: "Offer to send a summary email with key benefits and next steps.",
        reason: "Provides a tangible takeaway and encourages follow-up.",
        timestamp: 80,
      },
      {
        id: "s6",
        text: "Confirm their contact information for follow-up.",
        reason: "Ensures you can continue the conversation after the call.",
        timestamp: 90,
      },
    ]

    let currentTranscriptIndex = 0
    let currentSuggestionIndex = 0

    transcriptInterval = setInterval(() => {
      if (currentTranscriptIndex < mockTranscript.length) {
        setTranscript(prev => [...prev, mockTranscript[currentTranscriptIndex]])
        currentTranscriptIndex++
      } else {
        clearInterval(transcriptInterval)
      }
    }, 3000) // Add a new transcript line every 3 seconds

    suggestionTimeout = setInterval(() => {
      if (currentSuggestionIndex < mockSuggestions.length) {
        const nextSuggestion = mockSuggestions[currentSuggestionIndex]
        if (nextSuggestion.timestamp <= (currentTranscriptIndex * 3)) { // Check if suggestion's time has come (approx)
          setCurrentSuggestion(nextSuggestion)
          setSuggestions(prev => [...prev, nextSuggestion]) // Add to history
          currentSuggestionIndex++
        }
      } else {
        clearInterval(suggestionTimeout)
      }
    }, 1000); // Check for new suggestions every second

    return () => {
      clearInterval(transcriptInterval)
      clearInterval(suggestionTimeout)
    }
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto flex h-full">
      {/* Live Transcript Panel */}
      <Card className="flex-1 mr-6 flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl">Live Call Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3 text-gray-700">
              {transcript.map((line, index) => (
                <p key={index} className="text-lg leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Call Coach Panel */}
      <Card className="w-96 flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl">Call Coach Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div>
            {currentSuggestion && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 animate-pulse">
                <p className="text-blue-800 text-3xl font-bold mb-2 leading-tight">
                  {currentSuggestion.text}
                </p>
                <p className="text-blue-700 text-sm">
                  Reason: {currentSuggestion.reason}
                </p>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Suggestion History:</h3>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {suggestions.slice().reverse().map((sugg) => ( // Show most recent first
                  <div key={sugg.id} className="p-3 border rounded-lg bg-gray-50">
                    <p className="text-gray-900 font-medium">{sugg.text}</p>
                    <p className="text-gray-600 text-xs">Reason: {sugg.reason}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="text-center text-gray-500 text-sm mt-6">
            Suggestions are real-time and context-aware.
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 