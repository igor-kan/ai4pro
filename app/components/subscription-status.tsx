"use client"

import React from 'react'
import { CheckCircle, Clock, AlertTriangle, XCircle, Crown, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSubscription } from '@/app/context/subscription-context'

export function SubscriptionStatus() {
  const { 
    subscription, 
    isLoading, 
    isTrialing, 
    isActive, 
    daysLeftInTrial,
    upgradeSubscription,
    cancelSubscription,
    reactivateSubscription
  } = useSubscription()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'trialing':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'past_due':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'trialing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = () => {
    switch (subscription.status) {
      case 'active':
        return 'Active Subscription'
      case 'trialing':
        return 'Free Trial'
      case 'past_due':
        return 'Payment Due'
      case 'canceled':
        return 'Canceled'
      default:
        return 'Free Plan'
    }
  }

  const getPlanBadge = () => {
    const planColors = {
      free: 'bg-gray-100 text-gray-800',
      essentials: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800'
    }

    return (
      <Badge className={planColors[subscription.plan]}>
        {subscription.plan === 'premium' && <Crown className="w-3 h-3 mr-1" />}
        {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
      </Badge>
    )
  }

  const trialProgress = isTrialing ? Math.max(0, 100 - (daysLeftInTrial / 7) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Subscription Status</span>
          </div>
          {getPlanBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{getStatusText()}</p>
            {subscription.status === 'trialing' && (
              <p className="text-sm text-gray-600">
                {daysLeftInTrial} days remaining
              </p>
            )}
            {subscription.status === 'active' && subscription.currentPeriodEnd && (
              <p className="text-sm text-gray-600">
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <Badge className={getStatusColor()}>
            {subscription.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {isTrialing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Trial Progress</span>
              <span>{7 - daysLeftInTrial} of 7 days used</span>
            </div>
            <Progress value={trialProgress} className="h-2" />
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Your subscription will cancel on {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Available Features</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(subscription.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center space-x-2">
                {enabled ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )}
                <span className={enabled ? 'text-gray-900' : 'text-gray-400'}>
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t">
          {subscription.status === 'free' && (
            <Button
              onClick={upgradeSubscription}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
          )}
          
          {(subscription.status === 'trialing' || subscription.status === 'active') && subscription.plan !== 'premium' && (
            <Button
              onClick={upgradeSubscription}
              variant="outline"
              className="flex-1"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
          
          {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
            <Button
              onClick={cancelSubscription}
              variant="outline"
              className="flex-1"
            >
              Cancel Subscription
            </Button>
          )}
          
          {subscription.cancelAtPeriodEnd && (
            <Button
              onClick={reactivateSubscription}
              className="flex-1 bg-green-500 hover:bg-green-600"
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