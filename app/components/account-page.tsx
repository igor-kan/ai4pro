import { Edit, Lock, LogOut, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import SubscriptionStatus from "./subscription-status"
import { useSubscription } from "../context/subscription-context"

const AccountPage = () => {
  const { subscription, isActive } = useSubscription()
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Account</h1>
      
      {/* Subscription Status */}
      <div className="mb-8">
        <SubscriptionStatus />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Name</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">Igor Kan</span>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Industry</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">Software Development</span>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">AI Number</span>
            <div className="flex items-center space-x-2">
              {isActive ? (
                <>
                  <span className="text-gray-900">+1 (555) 123-4567</span>
                  <Phone className="w-4 h-4 text-green-500" />
                </>
              ) : (
                <>
                  <span className="text-gray-500 italic">Locked - Upgrade Required</span>
                  <Lock className="w-4 h-4 text-gray-400" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent">
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-2">Need extra help? Text Kevin at</p>
        <a href="tel:(628) 266-4233" className="text-blue-600 hover:text-blue-700">
          (628) 266-4233
        </a>
      </div>
    </div>
  )
}

export default AccountPage
