"use client"

import { useState, useEffect } from "react"
import { Plus, Play, Pause, Edit, Trash2, Eye, BarChart3, Target, DollarSign, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import PremiumButton from "@/components/ui/premium-button"

interface AdCampaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'draft' | 'completed'
  platform: 'google' | 'facebook' | 'instagram' | 'linkedin' | 'twitter'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  startDate: Date
  endDate: Date
  targetAudience: string
  adContent: {
    headline: string
    description: string
    imageUrl?: string
    callToAction: string
  }
}

interface AdMetrics {
  totalBudget: number
  totalSpent: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  ctr: number
  cpc: number
  roas: number
}

export default function BreezyAdsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    {
      id: '1',
      name: 'Local Service Area Campaign',
      status: 'active',
      platform: 'google',
      budget: 1000,
      spent: 450,
      impressions: 15000,
      clicks: 750,
      conversions: 35,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      targetAudience: 'Local homeowners 25-55',
      adContent: {
        headline: 'Professional Home Services',
        description: 'Get reliable, professional home services with 24/7 availability. Call now for instant quotes!',
        callToAction: 'Call Now'
      }
    },
    {
      id: '2',
      name: 'Social Media Brand Awareness',
      status: 'paused',
      platform: 'facebook',
      budget: 500,
      spent: 200,
      impressions: 8000,
      clicks: 320,
      conversions: 12,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      targetAudience: 'Local residents interested in home improvement',
      adContent: {
        headline: 'Transform Your Home Today',
        description: 'Professional services that deliver results. Join hundreds of satisfied customers.',
        callToAction: 'Learn More'
      }
    }
  ])

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCampaign, setNewCampaign] = useState<Partial<AdCampaign>>({
    status: 'draft',
    platform: 'google',
    budget: 100,
    targetAudience: '',
    adContent: {
      headline: '',
      description: '',
      callToAction: 'Call Now'
    }
  })

  const [metrics, setMetrics] = useState<AdMetrics>({
    totalBudget: 0,
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    ctr: 0,
    cpc: 0,
    roas: 0
  })

  useEffect(() => {
    calculateMetrics()
  }, [campaigns])

  const calculateMetrics = () => {
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
    
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0
    const roas = totalSpent > 0 ? (totalConversions * 150) / totalSpent : 0 // Assuming $150 avg conversion value

    setMetrics({
      totalBudget,
      totalSpent,
      totalImpressions,
      totalClicks,
      totalConversions,
      ctr,
      cpc,
      roas
    })
  }

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.adContent?.headline) return

    const campaign: AdCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name!,
      status: newCampaign.status as any || 'draft',
      platform: newCampaign.platform as any || 'google',
      budget: newCampaign.budget || 100,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      targetAudience: newCampaign.targetAudience || '',
      adContent: {
        headline: newCampaign.adContent?.headline || '',
        description: newCampaign.adContent?.description || '',
        callToAction: newCampaign.adContent?.callToAction || 'Call Now'
      }
    }

    setCampaigns(prev => [...prev, campaign])
    setNewCampaign({
      status: 'draft',
      platform: 'google',
      budget: 100,
      targetAudience: '',
      adContent: {
        headline: '',
        description: '',
        callToAction: 'Call Now'
      }
    })
    setShowCreateDialog(false)
  }

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ))
  }

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      google: 'bg-blue-500',
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-500',
      linkedin: 'bg-blue-700',
      twitter: 'bg-sky-500'
    }
    return colors[platform as keyof typeof colors] || 'bg-gray-500'
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Breezy Ads</h1>
            <p className="text-gray-600">Manage your advertising campaigns across all platforms</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <PremiumButton
                feature="analytics"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Campaign</span>
              </PremiumButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Ad Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={newCampaign.name || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={newCampaign.platform} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, platform: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Ads</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
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

                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Input
                    id="target-audience"
                    value={newCampaign.targetAudience || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="e.g., Local homeowners 25-55"
                  />
                </div>

                <div>
                  <Label htmlFor="headline">Ad Headline</Label>
                  <Input
                    id="headline"
                    value={newCampaign.adContent?.headline || ''}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      adContent: { ...prev.adContent, headline: e.target.value }
                    }))}
                    placeholder="Enter compelling headline"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Ad Description</Label>
                  <Textarea
                    id="description"
                    value={newCampaign.adContent?.description || ''}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      adContent: { ...prev.adContent, description: e.target.value }
                    }))}
                    placeholder="Enter ad description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="cta">Call to Action</Label>
                  <Select 
                    value={newCampaign.adContent?.callToAction} 
                    onValueChange={(value) => setNewCampaign(prev => ({ 
                      ...prev, 
                      adContent: { ...prev.adContent, callToAction: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Call Now">Call Now</SelectItem>
                      <SelectItem value="Learn More">Learn More</SelectItem>
                      <SelectItem value="Get Quote">Get Quote</SelectItem>
                      <SelectItem value="Book Now">Book Now</SelectItem>
                      <SelectItem value="Visit Website">Visit Website</SelectItem>
                    </SelectContent>
                  </Select>
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

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">${metrics.totalBudget}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${metrics.totalSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Impressions</p>
                <p className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-2xl font-bold">{metrics.totalConversions}</p>
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
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <Badge className={`text-white ${getPlatformColor(campaign.platform)}`}>
                      {campaign.platform.toUpperCase()}
                    </Badge>
                    <Badge className={`text-white ${getStatusColor(campaign.status)}`}>
                      {campaign.status.toUpperCase()}
                    </Badge>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold">${campaign.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="font-semibold">${campaign.spent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Impressions</p>
                    <p className="font-semibold">{campaign.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Clicks</p>
                    <p className="font-semibold">{campaign.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversions</p>
                    <p className="font-semibold">{campaign.conversions}</p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{campaign.adContent.headline}</p>
                  <p className="text-sm text-gray-600 mt-1">{campaign.adContent.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">Target: {campaign.targetAudience}</span>
                    <Badge variant="outline">{campaign.adContent.callToAction}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}