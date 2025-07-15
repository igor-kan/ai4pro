"use client"

import React, { useState } from 'react'
import { Lock, Crown, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSubscription } from '@/app/context/subscription-context'
import { cn } from '@/lib/utils'

interface PremiumButtonProps {
  feature: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  requiresPremium?: boolean
  showUpgradeModal?: boolean
}

export function PremiumButton({
  feature,
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  requiresPremium = false,
  showUpgradeModal = true
}: PremiumButtonProps) {
  const { subscription, isActive, startTrial } = useSubscription()
  const [showModal, setShowModal] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const hasRequiredFeature = subscription?.features.includes(feature) || false
  const isFeatureBlocked = !hasRequiredFeature && (requiresPremium || !isActive)

  const handleClick = () => {
    if (isFeatureBlocked) {
      if (showUpgradeModal) {
        setShowModal(true)
      }
      return
    }
    
    if (onClick) {
      onClick()
    }
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      if (!subscription) {
        // Start trial if no subscription
        startTrial()
      } else {
        // Redirect to upgrade page or handle premium upgrade
        window.location.href = '/upgrade'
      }
      setShowModal(false)
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  const getFeatureDisplayName = (featureName: string) => {
    const featureMap: Record<string, string> = {
      'ai-phone-number': 'AI Phone Number',
      'call-transcripts': 'Call Transcripts',
      'basic-ai': 'Basic AI Features',
      'sms-responses': 'SMS Auto-Responses',
      'advanced-ai': 'Advanced AI Features',
      'analytics': 'Analytics Dashboard',
      'custom-greetings': 'Custom Greetings',
      'api-access': 'API Access'
    }
    return featureMap[featureName] || featureName
  }

  return (
    <>
      <Button
        variant={isFeatureBlocked ? 'outline' : variant}
        size={size}
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          isFeatureBlocked && 'relative',
          className
        )}
      >
        {isFeatureBlocked && (
          <Lock className="w-4 h-4 mr-2 text-gray-500" />
        )}
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Premium Feature Required
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Unlock {getFeatureDisplayName(feature)}
              </h3>
              <p className="text-gray-600 mb-4">
                This feature requires a premium subscription to access all the advanced capabilities.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Advanced AI-powered features</li>
                <li>• Priority customer support</li>
                <li>• Enhanced analytics and reporting</li>
                <li>• Custom integrations</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    {!subscription ? 'Start Free Trial' : 'Upgrade Now'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PremiumButton