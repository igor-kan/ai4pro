"use client"

import { Phone, RefreshCw, Lock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useSubscription } from "../context/subscription-context"
import PremiumButton from "@/components/ui/premium-button"

export default function MissionControlPage() {
  const tabs = ["Tasks", "Analytics", "Payments", "Jobs"]
  const [activeTab, setActiveTab] = useState("Analytics")
  const { subscription, isActive } = useSubscription()

  return (
    <div className="flex flex-col h-full">
      {/* Trial Banner */}
      <div className="bg-blue-500 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Start a free trial to claim your AI-powered number and unlock all our features!</span>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-blue-600">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 relative">
        {/* Locked State Overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mission Control Locked</h3>
              <p className="text-gray-600 mb-6">Unlock advanced analytics and control features</p>
              <PremiumButton
                feature="mission-control"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
              >
                Start Free Trial
              </PremiumButton>
            </div>
          </div>
        )}

        {/* Blurred Content */}
        <div className={`max-w-6xl mx-auto p-6 ${!isActive ? 'filter blur-sm' : ''}`}>
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">Mission Control</h1>

          <div className="mb-8">
            <div className="flex space-x-6 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
            <div className="flex items-center space-x-3">
              <Select defaultValue="monthly">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Calls</h3>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Total", value: "0" },
                { label: "Inbound", value: "0" },
                { label: "Outbound", value: "0" },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <Phone className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
