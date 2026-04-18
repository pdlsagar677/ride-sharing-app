import React, { useState, useEffect } from 'react'
import { Shield, Star } from 'lucide-react'
import VehicleIcon from './VehicleIcon'

const WaitingForDriver = (props) => {
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (!props.ride?.createdAt) return
    const createdAt = new Date(props.ride.createdAt).getTime()
    const interval = setInterval(() => {
      const remaining = Math.max(60 - Math.floor((Date.now() - createdAt) / 1000), 0)
      setTimeLeft(remaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [props.ride?.createdAt])

  return (
    <div className='px-5 pb-6'>
      {/* OTP Display */}
      <div className='bg-gray-900 rounded-2xl p-5 mb-5 text-center'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <Shield size={14} className="text-emerald-400" />
          <p className='text-emerald-400 text-xs font-semibold uppercase tracking-wider'>Ride Verification OTP</p>
        </div>
        <h1 className='text-[36px] font-bold text-white tracking-[0.5em] font-mono leading-none'>
          {props.ride?.otp || '------'}
        </h1>
        <p className='text-gray-500 text-xs mt-2'>Share this code with your captain</p>
      </div>

      {/* Captain Card */}
      <div className='bg-gray-50 rounded-2xl p-4 mb-4'>
        <div className='flex items-center gap-3'>
          <VehicleIcon type={props.ride?.captain?.vehicle?.vehicleType} size="md" />
          <div className='flex-1 min-w-0'>
            <h2 className='text-base font-semibold text-gray-900 capitalize'>{props.ride?.captain?.fullname?.firstname}</h2>
            <div className='flex items-center gap-2'>
              <p className='text-xs text-gray-500 capitalize'>{props.ride?.captain?.vehicle?.vehicleType}</p>
              {props.ride?.captain?.averageRating > 0 && (
                <span className='flex items-center gap-0.5 text-xs text-amber-600 font-medium'>
                  <Star size={10} fill="currentColor" />{props.ride?.captain?.averageRating}
                </span>
              )}
            </div>
          </div>
          <div className='text-right flex-shrink-0'>
            <p className='text-base font-bold text-gray-900'>{props.ride?.captain?.vehicle?.plate}</p>
          </div>
        </div>
      </div>

      {/* Route + Fare */}
      <div className='bg-gray-50 rounded-2xl p-4 mb-4'>
        <div className='flex gap-3'>
          <div className='flex flex-col items-center pt-1.5'>
            <div className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
            <div className='w-[2px] h-7 bg-gray-200 my-1' />
            <div className='h-2.5 w-2.5 rounded-sm bg-red-500' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm text-gray-700 truncate'>{props.ride?.pickup}</p>
            <div className='h-4' />
            <p className='text-sm text-gray-700 truncate'>{props.ride?.destination}</p>
          </div>
        </div>
        <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-200'>
          <span className='text-sm text-gray-500'>Fare</span>
          <span className='text-lg font-bold text-gray-900'>Rs. {props.ride?.fare}</span>
        </div>
      </div>

      {/* Cancel */}
      {timeLeft > 0 ? (
        <button onClick={props.cancelRide} className='w-full bg-red-50 text-red-600 border border-red-200 py-3.5 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all'>
          Cancel Ride ({timeLeft}s)
        </button>
      ) : (
        <p className='text-center text-sm text-gray-400 py-3'>Cancellation window expired</p>
      )}
    </div>
  )
}

export default WaitingForDriver
