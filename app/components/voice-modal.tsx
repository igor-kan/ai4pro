"use client"

import { X, Volume2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface VoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceModal({ open, onOpenChange }: VoiceModalProps) {
  const voices = ["Mark", "Anna", "Bella", "Kathleen", "Elli", "Adam", "Arnold"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Voice</DialogTitle>
          <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 text-sm mb-6">
            Choose a voice for your AI assistant to use during calls. Click a voice to preview it.
          </p>

          <div className="space-y-3">
            {voices.map((voice, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <span className="text-gray-900">{voice}</span>
                <Button variant="ghost" size="sm">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
