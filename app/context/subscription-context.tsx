"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface Subscription {
  id: string
  plan: string
  status: 'active' | 'inactive' | 'trial' | 'expired'
  expiresAt?: Date
  features: string[]
}

interface SubscriptionContextType {
  subscription: Subscription | null
  isActive: boolean
  isTrialActive: boolean
  setSubscription: (subscription: Subscription | null) => void
  startTrial: () => void
  cancelSubscription: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    // Load saved subscription from localStorage
    const savedSubscription = localStorage.getItem('subscription')
    if (savedSubscription) {
      try {
        const parsed = JSON.parse(savedSubscription)
        if (parsed.expiresAt) {
          parsed.expiresAt = new Date(parsed.expiresAt)
        }
        setSubscription(parsed)
      } catch (error) {
        console.error('Error parsing saved subscription:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Save subscription to localStorage
    if (subscription) {
      localStorage.setItem('subscription', JSON.stringify(subscription))
    } else {
      localStorage.removeItem('subscription')
    }
  }, [subscription])

  const isActive = subscription?.status === 'active' || subscription?.status === 'trial'
  const isTrialActive = subscription?.status === 'trial'

  const startTrial = () => {
    const trialSubscription: Subscription = {
      id: 'trial-' + Date.now(),
      plan: 'trial',
      status: 'trial',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      features: ['ai-phone-number', 'call-transcripts', 'basic-ai', 'sms-responses']
    }
    setSubscription(trialSubscription)
  }

  const cancelSubscription = () => {
    setSubscription(null)
  }

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isActive,
      isTrialActive,
      setSubscription,
      startTrial,
      cancelSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export default SubscriptionContext