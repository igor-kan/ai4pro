"use client"

import { useState, useEffect } from "react"
import { Plus, Play, Pause, Edit, Trash2, Users, Mail, MessageSquare, Calendar, BarChart3, Target, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'mixed' | 'social'
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate: Date
  endDate: Date
  targetSegment: string
  totalContacts: number
  sentCount: number
  openRate: number
  clickRate: number
  conversionRate: number
  budget: number
  spent: number
  content: {
    subject?: string
    message: string
    callToAction: string
    templates: string[]
  }
  schedule: {
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
    time?: string
    daysOfWeek?: string[]
  }
  automation: {
    enabled: boolean
    triggers: string[]
    followUpActions: string[]
  }
}

interface CampaignTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'social'
  subject?: string
  content: string
  category: string
}

export default function BreezyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Spring Home Services Promotion',
      type: 'mixed',
      status: 'active',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      targetSegment: 'Previous customers',
      totalContacts: 1250,
      sentCount: 1000,
      openRate: 68,
      clickRate: 12,
      conversionRate: 8,
      budget: 500,
      spent: 320,
      content: {
        subject: 'Spring into Action - 20% Off Home Services!',
        message: 'Spring is here! Get your home ready with our professional services. Book now and save 20% on all maintenance and repair services.',
        callToAction: 'Book Service Now',
        templates: ['spring_promotion', 'service_discount']
      },
      schedule: {
        frequency: 'weekly',
        time: '10:00',
        daysOfWeek: ['Tuesday', 'Thursday']
      },
      automation: {
        enabled: true,
        triggers: ['email_open', 'link_click'],
        followUpActions: ['send_followup_sms', 'schedule_callback']
      }
    },
    {
      id: '2',
      name: 'New Customer Welcome Series',
      type: 'email',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      targetSegment: 'New customers',
      totalContacts: 85,
      sentCount: 75,
      openRate: 82,
      clickRate: 25,
      conversionRate: 15,
      budget: 200,
      spent: 45,
      content: {
        subject: 'Welcome to [Business Name] - Your Trusted Service Partner',
        message: 'Welcome! We\'re excited to serve you. Here\'s what you can expect from our team and how to get the most from our services.',
        callToAction: 'Learn More',
        templates: ['welcome_email', 'onboarding_series']
      },
      schedule: {
        frequency: 'immediate'
      },
      automation: {
        enabled: true,
        triggers: ['new_customer_signup'],
        followUpActions: ['send_day_2_email', 'send_week_1_survey']
      }
    }
  ])

  const [templates] = useState<CampaignTemplate[]>([
    {
      id: '1',
      name: 'Service Reminder',
      type: 'sms',
      content: 'Hi [Name]! Just a friendly reminder that your [Service] is due. Reply YES to schedule or call us at [Phone].',
      category: 'Maintenance'
    },
    {
      id: '2',
      name: 'Thank You Follow-up',
      type: 'email',
      subject: 'Thank you for choosing [Business Name]!',
      content: 'Thank you for trusting us with your [Service]. We hope you\'re completely satisfied. Please let us know if you need anything else!',
      category: 'Follow-up'
    },
    {
      id: '3',
      name: 'Seasonal Promotion',
      type: 'email',
      subject: '[Season] Special - Limited Time Offer!',
      content: 'Take advantage of our [Season] special! Get [Discount]% off on [Services]. Book before [Date] to secure your savings.',
      category: 'Promotions'
    }
  ])

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    type: 'email',
    status: 'draft',
    targetSegment: '',
    totalContacts: 0,
    budget: 100,
    content: {
      subject: '',
      message: '',
      callToAction: 'Learn More',
      templates: []
    },
    schedule: {
      frequency: 'immediate'
    },
    automation: {
      enabled: false,
      triggers: [],
      followUpActions: []
    }
  })

  const [activeTab, setActiveTab] = useState('campaigns')

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.content?.message) return

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name!,
      type: newCampaign.type as any || 'email',
      status: 'draft',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      targetSegment: newCampaign.targetSegment || '',
      totalContacts: newCampaign.totalContacts || 0,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      budget: newCampaign.budget || 100,
      spent: 0,
      content: {
        subject: newCampaign.content?.subject || '',
        message: newCampaign.content?.message || '',
        callToAction: newCampaign.content?.callToAction || 'Learn More',
        templates: newCampaign.content?.templates || []
      },
      schedule: newCampaign.schedule || { frequency: 'immediate' },
      automation: newCampaign.automation || { enabled: false, triggers: [], followUpActions: [] }
    }

    setCampaigns(prev => [...prev, campaign])
    setNewCampaign({
      type: 'email',
      status: 'draft',
      targetSegment: '',
      totalContacts: 0,
      budget: 100,
      content: {
        subject: '',
        message: '',
        callToAction: 'Learn More',
        templates: []
      },
      schedule: {
        frequency: 'immediate'
      },
      automation: {
        enabled: false,
        triggers: [],
        followUpActions: []
      }
    })
    setShowCreateDialog(false)
  }

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id 
        ? { 
            ...campaign, 
            status: campaign.status === 'active' ? 'paused' : 'active'
          }
        : campaign
    ))
  }

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      mixed: Users,
      social: Target
    }
    return icons[type as keyof typeof icons] || Mail
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      paused: 'bg-yellow-500',
      draft: 'bg-gray-500',
      completed: 'bg-blue-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const calculateTotalMetrics = () => {
    return campaigns.reduce((acc, campaign) => ({
      totalContacts: acc.totalContacts + campaign.totalContacts,
      totalSent: acc.totalSent + campaign.sentCount,
      avgOpenRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length : 0,
      avgClickRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length : 0,
      totalBudget: acc.totalBudget + campaign.budget,
      totalSpent: acc.totalSpent + campaign.spent
    }), { totalContacts: 0, totalSent: 0, avgOpenRate: 0, avgClickRate: 0, totalBudget: 0, totalSpent: 0 })
  }

  const metrics = calculateTotalMetrics()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Breezy Campaigns</h1>
            <p className="text-gray-600">Create and manage marketing campaigns across all channels</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Campaign Templates</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {templates.map((template) => {
                    const TypeIcon = getTypeIcon(template.type)
                    return (
                      <Card key={template.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <TypeIcon className="h-4 w-4" />
                              <span className="font-medium">{template.name}</span>
                            </div>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          {template.subject && (
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Subject: {template.subject}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {template.content}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input
                        id="campaign-name"
                        value={newCampaign.name || ''}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter campaign name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="campaign-type">Campaign Type</Label>
                      <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="mixed">Email + SMS</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target-segment">Target Segment</Label>
                      <Select 
                        value={newCampaign.targetSegment} 
                        onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetSegment: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_customers">All Customers</SelectItem>
                          <SelectItem value="new_customers">New Customers</SelectItem>
                          <SelectItem value="previous_customers">Previous Customers</SelectItem>
                          <SelectItem value="high_value">High Value Customers</SelectItem>
                          <SelectItem value="inactive">Inactive Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={newCampaign.budget || ''}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  {newCampaign.type === 'email' && (
                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={newCampaign.content?.subject || ''}
                        onChange={(e) => setNewCampaign(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, subject: e.target.value }
                        }))}
                        placeholder="Enter email subject"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="message">Message Content</Label>
                    <Textarea
                      id="message"
                      value={newCampaign.content?.message || ''}
                      onChange={(e) => setNewCampaign(prev => ({ 
                        ...prev, 
                        content: { ...prev.content, message: e.target.value }
                      }))}
                      placeholder="Enter your campaign message"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cta">Call to Action</Label>
                    <Select 
                      value={newCampaign.content?.callToAction} 
                      onValueChange={(value) => setNewCampaign(prev => ({ 
                        ...prev, 
                        content: { ...prev.content, callToAction: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Learn More">Learn More</SelectItem>
                        <SelectItem value="Book Now">Book Now</SelectItem>
                        <SelectItem value="Call Today">Call Today</SelectItem>
                        <SelectItem value="Get Quote">Get Quote</SelectItem>
                        <SelectItem value="Shop Now">Shop Now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="automation"
                      checked={newCampaign.automation?.enabled}
                      onCheckedChange={(checked) => setNewCampaign(prev => ({ 
                        ...prev, 
                        automation: { ...prev.automation, enabled: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="automation">Enable automation and follow-ups</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCampaign}>
                      Create Campaign
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{metrics.totalContacts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold">{metrics.totalSent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold">{metrics.avgOpenRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Click Rate</p>
                <p className="text-2xl font-bold">{metrics.avgClickRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const TypeIcon = getTypeIcon(campaign.type)
              const progress = campaign.totalContacts > 0 ? (campaign.sentCount / campaign.totalContacts) * 100 : 0
              
              return (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <TypeIcon className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <Badge className={`text-white ${getStatusColor(campaign.status)}`}>
                        {campaign.status.toUpperCase()}
                      </Badge>
                      {campaign.automation.enabled && (
                        <Badge variant="outline">Automated</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCampaignStatus(campaign.id)}
                      >
                        {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteCampaign(campaign.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{campaign.sentCount} / {campaign.totalContacts}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Open Rate</p>
                      <p className="font-semibold">{campaign.openRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Click Rate</p>
                      <p className="font-semibold">{campaign.clickRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="font-semibold">{campaign.conversionRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-semibold">${campaign.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Spent</p>
                      <p className="font-semibold">${campaign.spent}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded">
                    {campaign.content.subject && (
                      <p className="font-medium mb-1">Subject: {campaign.content.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">{campaign.content.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Target: {campaign.targetSegment}</span>
                      <Badge variant="outline">{campaign.content.callToAction}</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}