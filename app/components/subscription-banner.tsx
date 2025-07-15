"use client"

import { useState } from "react"
import { X, Phone, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SubscriptionBannerProps {
  onStartTrial: () => void
  onDismiss: () => void
}

export default function SubscriptionBanner({ onStartTrial, onDismiss }: SubscriptionBannerProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                Start a free trial to claim your AI-powered number and unlock all our features!
              </p>
              <p className="text-blue-100 text-sm">
                Get your dedicated business phone with 24/7 AI receptionist
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={onStartTrial}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-2"
            >
              Start Free Trial
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-white hover:bg-blue-600 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}