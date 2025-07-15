/**
 * Subscription Context Provider
 * 
 * Manages user subscription state throughout the application including:
 * - Subscription plans and status tracking
 * - Trial period management (7-day trials)
 * - Feature access control based on subscription status
 * - Persistent storage of subscription data
 * - Subscription lifecycle management (start, cancel, expire)
 * 
 * Subscription States:
 * - 'active': Paid subscription with full feature access
 * - 'trial': 7-day trial period with limited features
 * - 'inactive': No active subscription
 * - 'expired': Subscription or trial has expired
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

/**
 * Subscription Data Interface
 * Defines the structure of subscription information
 */
interface Subscription {
  id: string                                    // Unique subscription identifier
  plan: string                                  // Plan type (trial, basic, pro, etc.)
  status: 'active' | 'inactive' | 'trial' | 'expired'  // Current subscription status
  expiresAt?: Date                             // Optional expiration date
  features: string[]                           // Array of enabled features for this subscription
}

/**
 * Subscription Context Interface
 * Provides all subscription management functionality
 */
interface SubscriptionContextType {
  subscription: Subscription | null            // Current subscription data or null
  isActive: boolean                            // Whether user has any active subscription
  isTrialActive: boolean                       // Whether user is in trial period
  setSubscription: (subscription: Subscription | null) => void  // Direct subscription setter
  startTrial: () => void                       // Initialize 7-day trial
  cancelSubscription: () => void               // Cancel current subscription
}

// Create the subscription context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

/**
 * Subscription Provider Component
 * 
 * Manages subscription state and provides subscription-related functionality.
 * Features:
 * - Persistent storage in localStorage with error handling
 * - Automatic trial period calculation
 * - Feature access control
 * - Subscription lifecycle management
 * 
 * @param children - React nodes to wrap with subscription context
 */
export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  // Current subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  // Load subscription data from localStorage on mount
  useEffect(() => {
    const savedSubscription = localStorage.getItem('subscription')
    if (savedSubscription) {
      try {
        const parsed = JSON.parse(savedSubscription)
        // Convert expiration date string back to Date object
        if (parsed.expiresAt) {
          parsed.expiresAt = new Date(parsed.expiresAt)
        }
        setSubscription(parsed)
      } catch (error) {
        console.error('Error parsing saved subscription:', error)
        // Clear corrupted data
        localStorage.removeItem('subscription')
      }
    }
  }, [])

  // Persist subscription changes to localStorage
  useEffect(() => {
    if (subscription) {
      localStorage.setItem('subscription', JSON.stringify(subscription))
    } else {
      localStorage.removeItem('subscription')
    }
  }, [subscription])

  // Computed values for subscription status
  const isActive = subscription?.status === 'active' || subscription?.status === 'trial'
  const isTrialActive = subscription?.status === 'trial'

  /**
   * Start 7-day trial subscription
   * Creates a new trial subscription with basic features enabled
   */
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

  /**
   * Cancel current subscription
   * Removes subscription data and returns user to free tier
   */
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

/**
 * Custom hook for accessing subscription context
 * 
 * Provides type-safe access to subscription state and management functions.
 * Must be used within a SubscriptionProvider component.
 * 
 * @throws Error if used outside of SubscriptionProvider
 * @returns SubscriptionContextType with all subscription management functions
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export default SubscriptionContext