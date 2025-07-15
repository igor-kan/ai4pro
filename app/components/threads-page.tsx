"use client"

import { Search, MapPin, Clock, MoreHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useTheme } from "../context/theme-context"
import { cn } from "@/lib/utils"

export default function ThreadsPage() {
  const filters = ["All", "Unread", "Hidden"]
  const [activeFilter, setActiveFilter] = useState("All")
  const { theme, uiStyle } = useTheme()
  const isGlass = uiStyle === 'glass'
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col h-full">
      {/* Trial Banner */}
      <div className={cn(
        "p-3 flex items-center justify-between transition-all duration-300",
        isGlass
          ? cn(
              "backdrop-blur-xl border-b relative overflow-hidden",
              isDark
                ? "bg-blue-900/80 border-blue-700/30 text-blue-100"
                : "bg-blue-500/80 border-blue-400/30 text-white",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none"
            )
          : cn(
              "border-b",
              isDark
                ? "bg-blue-800 border-blue-700 text-blue-100"
                : "bg-blue-500 border-blue-400 text-white"
            )
      )}>
        <div className="flex items-center space-x-2 relative z-10">
          <span className="text-sm">Start a free trial to claim your AI-powered number and unlock all our features!</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "relative z-10 transition-all duration-300",
            isGlass
              ? cn(
                  "backdrop-blur-sm hover:backdrop-blur-md rounded-lg",
                  isDark
                    ? "text-blue-200 hover:bg-blue-800/30 hover:text-blue-100"
                    : "text-white hover:bg-blue-600/30 hover:text-blue-50"
                )
              : "text-white hover:bg-blue-600"
          )}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className={cn(
              "text-3xl font-bold mb-2 transition-colors duration-300",
              isDark ? "text-gray-100" : "text-gray-900"
            )}>
              Threads
            </h1>
            <p className={cn(
              "transition-colors duration-300",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Manage your conversation threads and messages
            </p>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-all duration-300 ease-out",
                    isGlass
                      ? cn(
                          "rounded-2xl backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5",
                          activeFilter === filter
                            ? isDark
                              ? "bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-blue-300 border-blue-400/30 shadow-blue-600/25"
                              : "bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white border-blue-300/30 shadow-blue-500/25"
                            : isDark
                              ? "text-gray-300 hover:text-gray-100 bg-gray-800/20 hover:bg-gray-700/30 border-gray-600/20"
                              : "text-gray-600 hover:text-gray-800 bg-white/10 hover:bg-white/20 border-white/20"
                        )
                      : cn(
                          "rounded-lg",
                          activeFilter === filter
                            ? isDark
                              ? "bg-blue-600 text-white"
                              : "bg-blue-500 text-white"
                            : isDark
                              ? "text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        )
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className={cn(
                "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2",
                isDark ? "text-gray-400" : "text-gray-500"
              )} />
              <Input
                placeholder="Search threads..."
                className={cn(
                  "pl-10 w-64 transition-all duration-300",
                  isGlass
                    ? cn(
                        "backdrop-blur-md border shadow-lg",
                        isDark
                          ? "bg-gray-800/20 border-gray-600/30 text-gray-200 placeholder:text-gray-400"
                          : "bg-white/20 border-white/30 text-gray-800 placeholder:text-gray-500"
                      )
                    : cn(
                        isDark
                          ? "bg-gray-800 border-gray-600 text-gray-200"
                          : "bg-white border-gray-300"
                      )
                )}
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="space-y-4">
            {/* Sample Thread */}
            <Card className={cn(
              "transition-all duration-300 cursor-pointer",
              isGlass
                ? "hover:shadow-2xl hover:scale-[1.01]"
                : "hover:shadow-lg"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback className={cn(
                      isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    )}>
                      JS
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={cn(
                        "font-semibold transition-colors duration-300",
                        isDark ? "text-gray-100" : "text-gray-900"
                      )}>
                        John Smith
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          SMS
                        </Badge>
                        <span className={cn(
                          "text-xs transition-colors duration-300",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          2 min ago
                        </span>
                      </div>
                    </div>
                    <p className={cn(
                      "text-sm mb-2 transition-colors duration-300",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}>
                      Hi, I'm interested in your services. Can you give me a quote for...
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin className={cn(
                          "w-3 h-3",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )} />
                        <span className={cn(
                          "transition-colors duration-300",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          (555) 123-4567
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className={cn(
                          "w-3 h-3",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )} />
                        <span className={cn(
                          "transition-colors duration-300",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          3 messages
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add more sample threads here with similar structure */}
            <Card className={cn(
              "transition-all duration-300 cursor-pointer",
              isGlass
                ? "hover:shadow-2xl hover:scale-[1.01]"
                : "hover:shadow-lg"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback className={cn(
                      isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    )}>
                      MW
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={cn(
                        "font-semibold transition-colors duration-300",
                        isDark ? "text-gray-100" : "text-gray-900"
                      )}>
                        Maria Wilson
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="text-xs">
                          Voice
                        </Badge>
                        <span className={cn(
                          "text-xs transition-colors duration-300",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          15 min ago
                        </span>
                      </div>
                    </div>
                    <p className={cn(
                      "text-sm mb-2 transition-colors duration-300",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}>
                      Thank you for the quick response! I'd like to schedule an appointment...
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin className={cn(
                          "w-3 h-3",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )} />
                        <span className={cn(
                          "transition-colors duration-300",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          (555) 987-6543
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className={cn(
                          "w-3 h-3",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )} />
                        <span className={cn(
                          "transition-colors duration-300",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          1 message
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
