"use client"

import { useState } from "react"
import Sidebar from "./components/sidebar"
import Header from "./components/header"
import InstructionsPage from "./components/instructions-page"
import CallPage from "./components/call-page"
import ThreadsPage from "./components/threads-page"
import AccountPage from "./components/account-page"
import MissionControlPage from "./components/mission-control-page"
import DialerPage from "./components/dialer-page"
import SMSPage from "./components/sms-page"
import AskBreezyPage from "./components/ask-breezy-page"
import BreezyAdsPage from "./components/breezy-ads-page"
import BreezyCampaignsPage from "./components/breezy-campaigns-page"
import BreezyKaraokePage from "./components/breezy-karaoke-page"
import SubscriptionBanner from "./components/subscription-banner"
import TrialSignupPage from "./components/trial-signup-page"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("instructions")
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(true)
  const [userSubscription, setUserSubscription] = useState<any>(null)

  const handleStartTrial = () => {
    setCurrentPage("trial-signup")
  }

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

  const renderPage = () => {
    switch (currentPage) {
      case "instructions":
        return <InstructionsPage onOpenPanel={setActivePanel} />
      case "call":
        return <CallPage onOpenPanel={setActivePanel} />
      case "sms":
        return <SMSPage onOpenPanel={setActivePanel} />
      case "threads":
        return <ThreadsPage onOpenPanel={setActivePanel} />
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
      case "breezy-karaoke":
        return <BreezyKaraokePage />
      case "trial-signup":
        return <TrialSignupPage onStartStripeCheckout={handleStartStripeCheckout} />
      default:
        return <InstructionsPage onOpenPanel={setActivePanel} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />
        
        {/* Subscription Banner */}
        {showSubscriptionBanner && !userSubscription && currentPage !== "trial-signup" && (
          <div className="px-6 pt-4">
            <SubscriptionBanner 
              onStartTrial={handleStartTrial}
              onDismiss={() => setShowSubscriptionBanner(false)}
            />
          </div>
        )}
        
        <main className={`flex-1 overflow-auto transition-all duration-300 ${activePanel ? "brightness-50" : ""}`}>
          {renderPage()}
        </main>
      </div>

      {/* Backdrop */}
      {activePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setActivePanel(null)} />
      )}
    </div>
  )
}
