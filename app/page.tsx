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

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("instructions")
  const [activePanel, setActivePanel] = useState<string | null>(null)

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
      default:
        return <InstructionsPage onOpenPanel={setActivePanel} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />
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
