import { useState } from "react"
import { Phone, PhoneCall, User, Clock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PremiumButton from "@/components/ui/premium-button"

export default function DialerPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const recentCalls = [
    { id: 1, name: "John Smith", number: "+1 (555) 123-4567", time: "2 min ago", type: "missed" },
    { id: 2, name: "Sarah Johnson", number: "+1 (555) 987-6543", time: "15 min ago", type: "outbound" },
    { id: 3, name: "Mike Wilson", number: "+1 (555) 456-7890", time: "1 hour ago", type: "inbound" },
    { id: 4, name: "Emma Davis", number: "+1 (555) 321-0987", time: "2 hours ago", type: "outbound" },
  ]

  const contacts = [
    { id: 1, name: "John Smith", number: "+1 (555) 123-4567", company: "ABC Corp" },
    { id: 2, name: "Sarah Johnson", number: "+1 (555) 987-6543", company: "XYZ Inc" },
    { id: 3, name: "Mike Wilson", number: "+1 (555) 456-7890", company: "Tech Solutions" },
    { id: 4, name: "Emma Davis", number: "+1 (555) 321-0987", company: "Design Studio" },
  ]

  const dialpadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ]

  const handleNumberPress = (number: string) => {
    setPhoneNumber(prev => prev + number)
  }

  const handleCall = (number: string) => {
    console.log('Initiating call to:', number)
  }

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'missed':
        return 'bg-red-100 text-red-800'
      case 'outbound':
        return 'bg-blue-100 text-blue-800'
      case 'inbound':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.number.includes(searchTerm)
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dialer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dialer Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Make a Call</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="text-lg text-center"
                />
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setPhoneNumber("")}
                    className="text-sm"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Dialpad */}
              <div className="grid grid-cols-3 gap-2">
                {dialpadNumbers.flat().map((number) => (
                  <Button
                    key={number}
                    variant="outline"
                    className="aspect-square text-lg font-semibold"
                    onClick={() => handleNumberPress(number)}
                  >
                    {number}
                  </Button>
                ))}
              </div>

              <div className="pt-4">
                <PremiumButton
                  feature="aiReceptionist"
                  onClick={() => handleCall(phoneNumber)}
                  disabled={!phoneNumber}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  <PhoneCall className="w-5 h-5 mr-2" />
                  Call
                </PremiumButton>
              </div>
            </CardContent>
          </Card>

          {/* Recent Calls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Calls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{call.name}</p>
                        <p className="text-sm text-gray-500">{call.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{call.time}</p>
                        <Badge className={getCallTypeColor(call.type)}>
                          {call.type}
                        </Badge>
                      </div>
                      <PremiumButton
                        feature="aiReceptionist"
                        onClick={() => handleCall(call.number)}
                        variant="outline"
                        size="sm"
                      >
                        <Phone className="w-4 h-4" />
                      </PremiumButton>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search contacts..."
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.company}</p>
                        <p className="text-sm text-gray-500">{contact.number}</p>
                      </div>
                    </div>
                    <PremiumButton
                      feature="aiReceptionist"
                      onClick={() => handleCall(contact.number)}
                      variant="outline"
                      size="sm"
                    >
                      <Phone className="w-4 h-4" />
                    </PremiumButton>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
