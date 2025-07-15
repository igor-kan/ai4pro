"use client"

import { X, Bell, Mail, MessageSquare, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "../../context/theme-context"
import { cn } from "@/lib/utils"

interface NotificationPreferencesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPreferencesPanel({ isOpen, onClose }: NotificationPreferencesPanelProps) {
  const { theme, uiStyle } = useTheme()
  const isGlass = uiStyle === 'glass'
  const isDark = theme === 'dark'

  if (!isOpen) return null

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full w-96 shadow-xl z-50 overflow-y-auto transition-all duration-300",
      isGlass
        ? cn(
            "backdrop-blur-xl border-l",
            isDark
              ? "bg-gray-900/80 border-gray-700/30"
              : "bg-white/80 border-white/30"
          )
        : cn(
            isDark
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          )
    )}>
      <div className={cn(
        "p-6 border-b transition-all duration-300",
        isGlass
          ? cn(
              "backdrop-blur-sm",
              isDark
                ? "border-gray-700/30 bg-gray-800/20"
                : "border-gray-200/30 bg-white/20"
            )
          : cn(
              isDark
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            )
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isGlass
                ? cn(
                    "backdrop-blur-sm shadow-lg",
                    isDark
                      ? "bg-orange-600/30 text-orange-300"
                      : "bg-orange-500/20 text-orange-600"
                  )
                : cn(
                    isDark
                      ? "bg-orange-600 text-orange-200"
                      : "bg-orange-100 text-orange-600"
                  )
            )}>
              <Bell className="w-5 h-5" />
            </div>
            <h2 className={cn(
              "text-lg font-semibold transition-colors duration-300",
              isDark ? "text-gray-100" : "text-gray-900"
            )}>
              Notification Preferences
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className={cn(
              "transition-all duration-300",
              isGlass
                ? cn(
                    "backdrop-blur-sm hover:backdrop-blur-md rounded-lg",
                    isDark
                      ? "hover:bg-gray-700/30 text-gray-300"
                      : "hover:bg-gray-200/30 text-gray-600"
                  )
                : cn(
                    isDark
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  )
            )}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className={cn(
            "text-lg font-medium mb-4 transition-colors duration-300",
            isDark ? "text-gray-100" : "text-gray-900"
          )}>
            Contact Information
          </h3>

          <div className="space-y-4">
            <div>
              <Label className={cn(
                "text-sm font-medium transition-colors duration-300",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Email Address
              </Label>
              <Input 
                placeholder="Enter your email" 
                className={cn(
                  "w-full mt-1 transition-all duration-300",
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
                defaultValue="" 
              />
            </div>

            <div>
              <Label className={cn(
                "text-sm font-medium transition-colors duration-300",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Phone Number
              </Label>
              <Input 
                placeholder="(416)-893-0095" 
                className={cn(
                  "w-full mt-1 transition-all duration-300",
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
                defaultValue="(416)-893-0095" 
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className={cn(
            "text-lg font-medium mb-4 transition-colors duration-300",
            isDark ? "text-gray-100" : "text-gray-900"
          )}>
            Notification Settings
          </h3>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isGlass
                        ? cn(
                            "backdrop-blur-sm",
                            isDark
                              ? "bg-blue-600/20 text-blue-300"
                              : "bg-blue-500/20 text-blue-600"
                          )
                        : cn(
                            isDark
                              ? "bg-blue-600/20 text-blue-400"
                              : "bg-blue-100 text-blue-600"
                          )
                    )}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isDark ? "text-gray-200" : "text-gray-900"
                      )}>
                        Email Notifications
                      </Label>
                      <p className={cn(
                        "text-xs transition-colors duration-300",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        Receive call summaries and transcripts
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isGlass
                        ? cn(
                            "backdrop-blur-sm",
                            isDark
                              ? "bg-green-600/20 text-green-300"
                              : "bg-green-500/20 text-green-600"
                          )
                        : cn(
                            isDark
                              ? "bg-green-600/20 text-green-400"
                              : "bg-green-100 text-green-600"
                          )
                    )}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isDark ? "text-gray-200" : "text-gray-900"
                      )}>
                        SMS Notifications
                      </Label>
                      <p className={cn(
                        "text-xs transition-colors duration-300",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        Get instant alerts for urgent calls
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isGlass
                        ? cn(
                            "backdrop-blur-sm",
                            isDark
                              ? "bg-purple-600/20 text-purple-300"
                              : "bg-purple-500/20 text-purple-600"
                          )
                        : cn(
                            isDark
                              ? "bg-purple-600/20 text-purple-400"
                              : "bg-purple-100 text-purple-600"
                          )
                    )}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isDark ? "text-gray-200" : "text-gray-900"
                      )}>
                        Voice Notifications
                      </Label>
                      <p className={cn(
                        "text-xs transition-colors duration-300",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        Receive callback requests
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h3 className={cn(
            "text-lg font-medium mb-4 transition-colors duration-300",
            isDark ? "text-gray-100" : "text-gray-900"
          )}>
            Delivery Schedule
          </h3>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Instant Notifications
                  </Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Daily Summary (5:00 PM)
                  </Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Weekly Report (Monday 9:00 AM)
                  </Label>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4">
          <Button className={cn(
            "w-full transition-all duration-300",
            isGlass
              ? cn(
                  "backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-[1.02]",
                  isDark
                    ? "bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white border-blue-500/30"
                    : "bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white border-blue-400/30"
                )
              : cn(
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )
          )}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
