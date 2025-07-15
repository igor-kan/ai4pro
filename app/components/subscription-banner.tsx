"use client"

import { useState } from "react"
import { X, Phone, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "../context/theme-context"
import { cn } from "@/lib/utils"

interface SubscriptionBannerProps {
  onStartTrial: () => void
  onDismiss: () => void
}

export default function SubscriptionBanner({ onStartTrial, onDismiss }: SubscriptionBannerProps) {
  const { theme, uiStyle } = useTheme()
  const isGlass = uiStyle === 'glass'
  const isDark = theme === 'dark'

  return (
    <Card className={cn(
      "border-none shadow-lg transition-all duration-300",
      isGlass
        ? cn(
            "backdrop-blur-xl relative overflow-hidden",
            isDark
              ? "bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-blue-700/30"
              : "bg-gradient-to-r from-blue-500/80 to-blue-600/80 border-blue-400/30",
            "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none"
          )
        : cn(
            "bg-gradient-to-r",
            isDark
              ? "from-blue-800 to-blue-900"
              : "from-blue-500 to-blue-600"
          ),
      "text-white"
    )}>
      <CardContent className="p-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex items-center space-x-2 p-2 rounded-xl transition-all duration-300",
              isGlass
                ? cn(
                    "backdrop-blur-sm shadow-lg",
                    isDark
                      ? "bg-blue-700/30 border border-blue-600/30"
                      : "bg-blue-400/20 border border-blue-300/30"
                  )
                : "bg-blue-600/20"
            )}>
              <Phone className="h-5 w-5" />
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                Start a free trial to claim your AI-powered number and unlock all our features!
              </p>
              <p className={cn(
                "text-sm transition-colors duration-300",
                isDark ? "text-blue-200" : "text-blue-100"
              )}>
                Get your dedicated business phone with 24/7 AI receptionist
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={onStartTrial}
              className={cn(
                "font-semibold px-6 py-2 transition-all duration-300",
                isGlass
                  ? cn(
                      "backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02]",
                      isDark
                        ? "bg-white/90 text-blue-900 border-white/30 hover:bg-white hover:text-blue-800"
                        : "bg-white/90 text-blue-600 border-white/30 hover:bg-white"
                    )
                  : "bg-white text-blue-600 hover:bg-blue-50"
              )}
            >
              Start Free Trial
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={cn(
                "p-1 transition-all duration-300",
                isGlass
                  ? cn(
                      "backdrop-blur-sm hover:backdrop-blur-md rounded-lg",
                      isDark
                        ? "text-blue-200 hover:bg-blue-800/30 hover:text-blue-100"
                        : "text-white hover:bg-blue-600/30 hover:text-blue-50"
                    )
                  : "text-white hover:bg-blue-600"
              )}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}