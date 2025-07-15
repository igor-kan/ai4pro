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
import CallCoachPage from "./components/call-coach-page"
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
      {/* Animated Background - Glass UI only */}
      <div className="glass-ui:block hidden absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950"></div>
      <div className="glass-ui:block hidden absolute inset-0 bg-gradient-to-tr from-blue-200/30 via-transparent to-purple-200/30 dark:from-blue-800/20 dark:via-transparent dark:to-purple-800/20"></div>
      <div className="glass-ui:block hidden absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="glass-ui:block hidden absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="glass-ui:block hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-300/10 to-blue-300/10 dark:from-pink-800/5 dark:to-blue-800/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      
      {/* Ordinary Background */}
      <div className="glass-ui:hidden block absolute inset-0 bg-gray-50 dark:bg-gray-900"></div>
      
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col glass-ui:backdrop-blur-sm">
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
        <div className="fixed inset-0 glass-ui:bg-black/20 glass-ui:backdrop-blur-sm bg-black/50 z-40" onClick={() => setActivePanel(null)} />
      )}
    </div>
  )
}
