import React from 'react'
import useAuthStore from '../stores/useAuthStore'
import { Timer, Route, Star } from 'lucide-react'

const CaptainDetails = () => {
  const { captain } = useAuthStore()

  return (
    <div>
      {/* Captain Info */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-600 uppercase">
              {captain?.fullname?.firstname?.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="text-base font-semibold capitalize text-gray-900">
              {captain?.fullname?.firstname} {captain?.fullname?.lastname}
            </h4>
            <p className="text-xs text-gray-500 capitalize">{captain?.vehicle?.vehicleType} - {captain?.vehicle?.plate}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Earnings</p>
          <h4 className="text-lg font-bold text-gray-900">Rs. 0</h4>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <Timer size={20} className="text-gray-500 mx-auto mb-1" />
          <h5 className="text-base font-semibold text-gray-900">0</h5>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Hours</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <Route size={20} className="text-gray-500 mx-auto mb-1" />
          <h5 className="text-base font-semibold text-gray-900">0</h5>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Trips</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <Star size={20} className={`mx-auto mb-1 ${captain?.averageRating > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
          <h5 className="text-base font-semibold text-gray-900">{captain?.averageRating > 0 ? captain.averageRating : '--'}</h5>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Rating ({captain?.totalRatings || 0})</p>
        </div>
      </div>
    </div>
  )
}

export default CaptainDetails
