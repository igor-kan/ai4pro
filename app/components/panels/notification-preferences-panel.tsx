"use client"

import { X, Mail, Phone, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface NotificationPreferencesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPreferencesPanel({ isOpen, onClose }: NotificationPreferencesPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>

          <div className="space-y-4">
            <div>
              <Input placeholder="Enter your email" className="w-full" defaultValue="" />
            </div>

            <div>
              <Input placeholder="(416)-893-0095" className="w-full" defaultValue="(416)-893-0095" />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <div className="flex space-x-6 mb-6">
            <button className="flex items-center space-x-2 text-blue-600 border-b-2 border-blue-600 pb-2">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Phone Calls</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 pb-2">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Text Messages</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Enable phone call notifications</span>
              <Switch defaultChecked />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-900">Phone Call Notifications</span>
                <span className="text-sm text-gray-500">Select notification methods (can select both)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <Checkbox />
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">Email</span>
                </div>
                <div className="flex items-center space-x-2 p-3 border-2 border-blue-500 bg-blue-50 rounded-lg">
                  <Checkbox defaultChecked />
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">Phone</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Include extra details in email notifications</h4>
            <p className="text-sm text-gray-600 mb-4">
              When enabled, call transcriptions and the results of AI actions will be included in notifications
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Call Information</h4>
            <p className="text-sm text-gray-600 mb-3">Add information you want included in your email notifications</p>
            <div className="flex">
              <Textarea placeholder="e.g. location details, job price" className="flex-1" />
              <Button className="ml-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
