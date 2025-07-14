"use client"

import { Search, MapPin, Clock, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"

export default function ThreadsPage() {
  const filters = ["All", "Unread", "Hidden"]
  const [activeFilter, setActiveFilter] = useState("All")

  return (
    <div className="flex h-full">
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Threads</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search by phone number or conversation..." className="pl-10" />
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="text-xs"
              >
                {filter}
              </Button>
            ))}
            <Button variant="ghost" size="sm">
              <MapPin className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Clock className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
            <Avatar>
              <AvatarFallback className="bg-purple-100 text-purple-600">K</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Kevin (CEO of Breezy)</h3>
              <p className="text-sm text-gray-500">No recent conversations</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to view details</p>
      </div>
    </div>
  )
}
