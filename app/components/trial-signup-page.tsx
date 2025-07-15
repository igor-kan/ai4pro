"use client"

import { useState } from "react"
import { Check, Phone, MessageSquare, Bot, Users, BarChart3, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TrialSignupPageProps {
  onStartStripeCheckout: () => void
}

export default function TrialSignupPage({ onStartStripeCheckout }: TrialSignupPageProps) {
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    {
      icon: Phone,
      title: "Dedicated Phone Number",
      description: "Get a local or toll-free number for your business"
    },
    {
      icon: Bot,
      title: "24/7 AI Receptionist",
      description: "Never miss a call with intelligent AI handling"
    },
    {
      icon: Shield,
      title: "Lead Screening & Routing",
      description: "Qualify leads and route calls to the right person"
    },
    {
      icon: MessageSquare,
      title: "Unlimited AI-powered SMS",
      description: "Handle text messages with smart responses"
    },
    {
      icon: BarChart3,
      title: "Call Summaries & Transcripts",
      description: "Get detailed insights from every conversation"
    },
    {
      icon: Users,
      title: "Intelligent CRM & Follow-ups",
      description: "Automated lead management and customer tracking"
    }
  ]

  const handleStartTrial = async () => {
    setIsLoading(true)
    try {
      await onStartStripeCheckout()
    } catch (error) {
      console.error('Error starting trial:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-800 mb-4">
            7-Day Free Trial
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start a trial to claim your AI-powered phone number
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your business communication with intelligent AI that never sleeps
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Everything you need to scale your business
            </h2>
            
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
              <div className="flex items-center space-x-2 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  Works with any phone
                </span>
              </div>
              <p className="text-green-700 text-sm">
                Use your existing mobile, landline, or VoIP system. No hardware required.
              </p>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="lg:sticky lg:top-8">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Essentials
                </CardTitle>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="text-4xl font-bold text-gray-900">$50</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mt-2">
                  Your business phone with a 24/7 AI receptionist that handles calls and messages
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    "Dedicated phone number",
                    "24/7 AI receptionist",
                    "Lead screening, FAQs, and routing",
                    "Unlimited AI-powered SMS",
                    "Automatic call summaries + transcripts",
                    "Intelligent CRM and follow ups",
                    "Works with any phone"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      Free Trial
                    </Badge>
                  </div>
                  <p className="text-blue-800 text-sm font-medium">
                    7 days free, then $50/month. Cancel anytime.
                  </p>
                </div>

                <Button
                  onClick={handleStartTrial}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Start Trial</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  No credit card required for trial. Secure payment processed by Stripe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Trusted by hundreds of businesses</p>
          <div className="flex justify-center items-center space-x-8 text-gray-400">
            <div className="text-sm">🔒 Secure & Encrypted</div>
            <div className="text-sm">⚡ 99.9% Uptime</div>
            <div className="text-sm">📞 24/7 Support</div>
            <div className="text-sm">💳 Stripe Secured</div>
          </div>
        </div>
      </div>
    </div>
  )
}