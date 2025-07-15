"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Phone, MessageSquare, Mail, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PremiumButton from "@/components/ui/premium-button"

interface Message {
  id: string
  content: string
  sender: 'user' | 'breezy'
  timestamp: Date
  channel: 'chat' | 'sms' | 'email' | 'voice' | 'video'
}

interface Channel {
  id: string
  name: string
  icon: any
  description: string
  active: boolean
}

export default function AskBreezyPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m Breezy, your AI assistant. I can help you across multiple channels - chat, SMS, email, voice, and video calls. How can I assist you today?',
      sender: 'breezy',
      timestamp: new Date(),
      channel: 'chat'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [activeChannel, setActiveChannel] = useState<'chat' | 'sms' | 'email' | 'voice' | 'video'>('chat')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channels: Channel[] = [
    { id: 'chat', name: 'Chat', icon: MessageSquare, description: 'Real-time text conversation', active: true },
    { id: 'sms', name: 'SMS', icon: Phone, description: 'Text messaging integration', active: true },
    { id: 'email', name: 'Email', icon: Mail, description: 'Email communication', active: true },
    { id: 'voice', name: 'Voice', icon: Mic, description: 'Voice calls and commands', active: false },
    { id: 'video', name: 'Video', icon: Video, description: 'Video conferencing', active: false }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      channel: activeChannel
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue, activeChannel),
        sender: 'breezy',
        timestamp: new Date(),
        channel: activeChannel
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const generateAIResponse = (input: string, channel: string): string => {
    const responses = {
      chat: `I understand you said "${input}". Through our chat channel, I can provide real-time assistance with your business needs.`,
      sms: `Thanks for your message! Via SMS, I can help you manage customer communications and send quick updates.`,
      email: `I received your email inquiry about "${input}". I can help draft professional email responses and manage your correspondence.`,
      voice: `I heard you mention "${input}". Through voice calls, I can provide hands-free assistance and take verbal instructions.`,
      video: `In our video call about "${input}", I can provide visual assistance and screen sharing capabilities.`
    }
    return responses[channel as keyof typeof responses] || responses.chat
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Voice recording functionality would be implemented here
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask Breezy</h1>
        <p className="text-gray-600">Multi-channel AI assistant for your business communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Channel Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communication Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {channels.map((channel) => {
                const IconComponent = channel.icon
                return (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeChannel === channel.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!channel.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => channel.active && setActiveChannel(channel.id as any)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{channel.name}</span>
                      {channel.active ? (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{channel.description}</p>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {(() => {
                    const ActiveIcon = channels.find(c => c.id === activeChannel)?.icon || MessageSquare
                    return <ActiveIcon className="h-5 w-5" />
                  })()}
                  <span>Breezy Assistant - {channels.find(c => c.id === activeChannel)?.name}</span>
                </CardTitle>
                <Badge variant="outline">
                  {activeChannel.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {message.channel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type your message for ${activeChannel}...`}
                  className="flex-1"
                />
                {activeChannel === 'voice' && (
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleRecording}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
                <PremiumButton
                  feature="aiReceptionist"
                  onClick={handleSendMessage}
                >
                  <Send className="h-4 w-4" />
                </PremiumButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Channel Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        {channels.map((channel) => {
          const IconComponent = channel.icon
          return (
            <Card key={channel.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{channel.name}</p>
                    <p className="text-sm text-gray-600">
                      {channel.active ? 'Ready' : 'Coming Soon'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}