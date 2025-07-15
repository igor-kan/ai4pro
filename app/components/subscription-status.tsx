"use client"

import React from 'react'
import { CheckCircle, Clock, AlertTriangle, XCircle, Crown, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSubscription } from '@/app/context/subscription-context'
import { useTheme } from '../context/theme-context'
import { cn } from '@/lib/utils'

export function SubscriptionStatus() {
  const { 
    subscription, 
    isActive, 
    isTrialActive,
    startTrial,
    cancelSubscription
  } = useSubscription()

  const { theme, uiStyle } = useTheme()
  const isGlass = uiStyle === 'glass'
  const isDark = theme === 'dark'

  if (!subscription) {
    // No subscription state
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} />
              <span className={cn(
                "transition-colors duration-300",
                isDark ? "text-gray-100" : "text-gray-900"
              )}>
                Subscription Status
              </span>
            </div>
            <Badge className={cn(
              isGlass 
                ? isDark
                  ? 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                  : 'bg-gray-500/20 text-gray-700 border-gray-400/30'
                : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-800',
              isGlass && "backdrop-blur-md border"
            )}>
              Free
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn(
                "font-medium transition-colors duration-300",
                isDark ? "text-gray-100" : "text-gray-900"
              )}>
                Free Plan
              </p>
              <p className={cn(
                "text-sm transition-colors duration-300",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                Start a trial to unlock all features
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={startTrial}
              className={cn(
                "w-full transition-all duration-300",
                isGlass
                  ? cn(
                      "backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02]",
                      isDark
                        ? "bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white border-blue-500/30"
                        : "bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white border-blue-400/30"
                    )
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              )}
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'trial':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <XCircle className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} />
    }
  }

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'active':
        return isGlass
          ? isDark
            ? 'bg-green-600/20 text-green-300 border-green-500/30'
            : 'bg-green-500/20 text-green-700 border-green-400/30'
          : isDark
            ? 'bg-green-900 text-green-300 border-green-700'
            : 'bg-green-100 text-green-800 border-green-200'
      case 'trial':
        return isGlass
          ? isDark
            ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
            : 'bg-blue-500/20 text-blue-700 border-blue-400/30'
          : isDark
            ? 'bg-blue-900 text-blue-300 border-blue-700'
            : 'bg-blue-100 text-blue-800 border-blue-200'
      case 'expired':
        return isGlass
          ? isDark
            ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
            : 'bg-yellow-500/20 text-yellow-700 border-yellow-400/30'
          : isDark
            ? 'bg-yellow-900 text-yellow-300 border-yellow-700'
            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive':
        return isGlass
          ? isDark
            ? 'bg-red-600/20 text-red-300 border-red-500/30'
            : 'bg-red-500/20 text-red-700 border-red-400/30'
          : isDark
            ? 'bg-red-900 text-red-300 border-red-700'
            : 'bg-red-100 text-red-800 border-red-200'
      default:
        return isGlass
          ? isDark
            ? 'bg-gray-600/20 text-gray-300 border-gray-500/30'
            : 'bg-gray-500/20 text-gray-700 border-gray-400/30'
          : isDark
            ? 'bg-gray-800 text-gray-300 border-gray-600'
            : 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = () => {
    switch (subscription.status) {
      case 'active':
        return 'Active Subscription'
      case 'trial':
        return 'Free Trial'
      case 'expired':
        return 'Expired'
      case 'inactive':
        return 'Inactive'
      default:
        return 'Unknown Status'
    }
  }

  const getPlanBadge = () => {
    const planColors = {
      trial: isGlass 
        ? isDark
          ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
          : 'bg-blue-500/20 text-blue-700 border-blue-400/30'
        : isDark
          ? 'bg-blue-900 text-blue-300'
          : 'bg-blue-100 text-blue-800',
      basic: isGlass
        ? isDark
          ? 'bg-gray-600/20 text-gray-300 border-gray-500/30'
          : 'bg-gray-500/20 text-gray-700 border-gray-400/30'
        : isDark
          ? 'bg-gray-800 text-gray-300'
          : 'bg-gray-100 text-gray-800',
      premium: isGlass
        ? isDark
          ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
          : 'bg-purple-500/20 text-purple-700 border-purple-400/30'
        : isDark
          ? 'bg-purple-900 text-purple-300'
          : 'bg-purple-100 text-purple-800'
    }

    const planKey = subscription.plan as keyof typeof planColors
    const colorClass = planColors[planKey] || planColors.basic

    return (
      <Badge className={cn(
        colorClass,
        isGlass && "backdrop-blur-md border"
      )}>
        {subscription.plan === 'premium' && <Crown className="w-3 h-3 mr-1" />}
        {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
      </Badge>
    )
  }

  const getDaysLeft = () => {
    if (!subscription.expiresAt) return 0
    const now = new Date()
    const expiry = new Date(subscription.expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const daysLeft = getDaysLeft()
  const trialProgress = isTrialActive ? Math.max(0, 100 - (daysLeft / 7) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={cn(
              "transition-colors duration-300",
              isDark ? "text-gray-100" : "text-gray-900"
            )}>
              Subscription Status
            </span>
          </div>
          {getPlanBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              "font-medium transition-colors duration-300",
              isDark ? "text-gray-100" : "text-gray-900"
            )}>
              {getStatusText()}
            </p>
            {subscription.status === 'trial' && (
              <p className={cn(
                "text-sm transition-colors duration-300",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {daysLeft} days remaining
              </p>
            )}
            {subscription.status === 'active' && subscription.expiresAt && (
              <p className={cn(
                "text-sm transition-colors duration-300",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                Expires on {new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Badge className={cn(
            getStatusColor(),
            isGlass && "backdrop-blur-md border"
          )}>
            {subscription.status.toUpperCase()}
          </Badge>
        </div>

        {isTrialActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={cn(
                "transition-colors duration-300",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Trial Progress
              </span>
              <span className={cn(
                "transition-colors duration-300",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {7 - daysLeft} of 7 days used
              </span>
            </div>
            <Progress value={trialProgress} className="h-2" />
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-2">
          <h4 className={cn(
            "font-medium transition-colors duration-300",
            isDark ? "text-gray-100" : "text-gray-900"
          )}>
            Available Features
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {subscription.features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className={cn(
                  "transition-colors duration-300",
                  isDark ? "text-gray-200" : "text-gray-900"
                )}>
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/-/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={cn(
          "flex space-x-2 pt-4 border-t transition-colors duration-300",
          isDark ? "border-gray-600" : "border-gray-200"
        )}>
          {(subscription.status === 'active' || subscription.status === 'trial') && (
            <Button
              onClick={cancelSubscription}
              variant="outline"
              className="flex-1"
            >
              Cancel Subscription
            </Button>
          )}
          
          {subscription.status === 'inactive' && (
            <Button
              onClick={startTrial}
              className={cn(
                "flex-1 transition-all duration-300",
                isGlass
                  ? cn(
                      "backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02]",
                      isDark
                        ? "bg-gradient-to-r from-green-600/80 to-green-700/80 text-white border-green-500/30"
                        : "bg-gradient-to-r from-green-500/80 to-green-600/80 text-white border-green-400/30"
                    )
                  : "bg-green-500 hover:bg-green-600"
              )}
            >
              Reactivate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionStatus