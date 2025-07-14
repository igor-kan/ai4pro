"use client"

import { X, User, Building, Phone, Mail, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface CallerDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CallerDetailsModal({ open, onOpenChange }: CallerDetailsModalProps) {
  const fields = [
    { icon: User, label: "Caller name", checked: true },
    { icon: Building, label: "Business name", checked: false },
    { icon: Phone, label: "Phone number", checked: true },
    { icon: Mail, label: "Email", checked: false },
    { icon: MapPin, label: "Address", checked: false },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Caller Details</DialogTitle>
          <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 text-sm mb-6">
            Select the contact information for your AI to collect from callers when taking a message.
          </p>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <field.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{field.label}</span>
                </div>
                <Checkbox defaultChecked={field.checked} />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
