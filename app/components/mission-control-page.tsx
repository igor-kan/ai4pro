"use client"

import { Phone, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function MissionControlPage() {
  const tabs = ["Tasks", "Analytics", "Payments", "Jobs"]
  const [activeTab, setActiveTab] = useState("Analytics")

  return (
    <div className="max-w-6xl mx-auto p-6">
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
  )
}
