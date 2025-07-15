/**
 * Main Dashboard Page Component
 * 
 * This is the primary application component that orchestrates the entire dashboard interface.
 * It manages:
 * - Page routing and navigation between different sections
 * - Subscription state and trial management
 * - Theme-aware animated backgrounds for glass UI mode
 * - Modal panels and overlays
 * - Stripe payment integration for subscriptions
 */

"use client"

import { useState } from "react"
// Core layout components
import Sidebar from "./components/sidebar"
import Header from "./components/header"
// Page components for different dashboard sections
import InstructionsPage from "./components/instructions-page"
import CallPage from "./components/call-page"
import ThreadsPage from "./components/threads-page"
import AccountPage from "./components/account-page"
import MissionControlPage from "./components/mission-control-page"
import DialerPage from "./components/dialer-page"
import SMSPage from "./components/sms-page"
// Feature pages (Ask Breezy, Ads, Campaigns, Coach)
import AskBreezyPage from "./components/ask-breezy-page"
import BreezyAdsPage from "./components/breezy-ads-page"
import BreezyCampaignsPage from "./components/breezy-campaigns-page"
import CallCoachPage from "./components/call-coach-page"
// Subscription and trial components
import SubscriptionBanner from "./components/subscription-banner"
import TrialSignupPage from "./components/trial-signup-page"
import { useSubscription } from "./context/subscription-context"

/**
 * Main Dashboard Component
 * 
 * Handles the complete dashboard interface with:
 * - Multi-page navigation system
 * - Subscription management and trial flow
 * - Animated glassmorphism backgrounds
 * - Modal panel system
 * - Stripe payment integration
 */
export default function Dashboard() {
  // Current active page in the dashboard
  const [currentPage, setCurrentPage] = useState("instructions")
  // Currently open modal panel (null if none)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  // Controls visibility of subscription promotion banner
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(true)
  // Subscription context for managing user subscription state
  const { subscription, isActive } = useSubscription()

  /**
   * Handles trial signup initiation
   * Navigates user to trial signup page
   */
  const handleStartTrial = () => {
    setCurrentPage("trial-signup")
  }

  /**
   * Initiates Stripe checkout session for subscription
   * Creates a checkout session and redirects user to Stripe payment page
   */
  const handleStartStripeCheckout = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  /**
   * Renders the appropriate page component based on current navigation state
   * Supports all dashboard sections and feature pages
   * 
   * @returns The React component for the current page
   */
  const renderPage = () => {
    switch (currentPage) {
      case "instructions":
        return <InstructionsPage onOpenPanel={setActivePanel} />
      case "call":
        return <CallPage onOpenPanel={setActivePanel} />
      case "sms":
        return <SMSPage onOpenPanel={setActivePanel} />
      case "threads":
        return <ThreadsPage />
      case "dialer":
        return <DialerPage />
      case "mission-control":
        return <MissionControlPage />
      case "account":
        return <AccountPage />
      case "ask-breezy":
        return <AskBreezyPage />
      case "breezy-ads":
        return <BreezyAdsPage />
      case "breezy-campaigns":
        return <BreezyCampaignsPage />
      case "call-coach":
        return <CallCoachPage />
      case "trial-signup":
        return <TrialSignupPage onStartStripeCheckout={handleStartStripeCheckout} />
      default:
        return <InstructionsPage onOpenPanel={setActivePanel} />
    }
  }

  return (
    <div className="flex h-screen relative overflow-hidden transition-colors duration-300">
      {/* 
        Animated Background System - Glass UI Mode Only
        Creates a multi-layered animated background with:
        - Base gradient backgrounds that adapt to light/dark themes
        - Floating blur orbs with pulse animations
        - Large spinning gradient overlay for dynamic movement
        - 20-second rotation cycle for subtle continuous motion
      */}
      <div className="glass-ui:block hidden absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950"></div>
      <div className="glass-ui:block hidden absolute inset-0 bg-gradient-to-tr from-blue-200/30 via-transparent to-purple-200/30 dark:from-blue-800/20 dark:via-transparent dark:to-purple-800/20"></div>
      {/* Floating blur orbs with pulse animations */}
      <div className="glass-ui:block hidden absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="glass-ui:block hidden absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      {/* Large spinning gradient overlay for dynamic background movement */}
      <div className="glass-ui:block hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-300/10 to-blue-300/10 dark:from-pink-800/5 dark:to-blue-800/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      
      {/* Simple/Ordinary Background - Solid colors for non-glass UI mode */}
      <div className="glass-ui:hidden block absolute inset-0 bg-gray-50 dark:bg-gray-900"></div>
      
      {/* Main application layout */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col glass-ui:backdrop-blur-sm">
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />
        
        {/* 
          Subscription Banner
          Shows promotional banner for trial/subscription when:
          - Banner hasn't been dismissed
          - User doesn't have active subscription
          - Not currently on trial signup page
        */}
        {showSubscriptionBanner && !isActive && currentPage !== "trial-signup" && (
          <div className="px-6 pt-4">
            <SubscriptionBanner 
              onStartTrial={handleStartTrial}
              onDismiss={() => setShowSubscriptionBanner(false)}
            />
          </div>
        )}
        
        {/* 
          Main content area
          Dims when modal panels are open for better focus
        */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${activePanel ? "brightness-50" : ""}`}>
          {renderPage()}
        </main>
      </div>

      {/* 
        Modal backdrop overlay
        Appears when any panel is open, with theme-aware styling:
        - Glass UI: Semi-transparent with backdrop blur
        - Simple UI: Standard semi-transparent overlay
      */}
      {activePanel && (
        <div className="fixed inset-0 glass-ui:bg-black/20 glass-ui:backdrop-blur-sm bg-black/50 z-40" onClick={() => setActivePanel(null)} />
      )}
    </div>
  )
}
