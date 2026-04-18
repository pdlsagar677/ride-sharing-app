import React, { useState } from 'react'
import { Banknote, Check, X, Minus, Plus, Star } from 'lucide-react'
import api from '../lib/axios'
import { toast } from 'react-toastify'

const RidePopUp = ({ ride, setRidePopupPanel, setConfirmRidePopupPanel, confirmRide }) => {
  const [showCounter, setShowCounter] = useState(false)
  const [counterAmount, setCounterAmount] = useState(ride?.fare || 0)
  const [sending, setSending] = useState(false)

  if (!ride) return null

  const isNegotiable = ride?.isNegotiable
  const suggestedFare = ride?.suggestedFare

  const adjustCounter = (amount) => {
    const min = Math.round((suggestedFare || ride.fare) * 0.5)
    const max = Math.round((suggestedFare || ride.fare) * 3)
    const newVal = counterAmount + amount
    if (newVal >= min && newVal <= max) setCounterAmount(newVal)
  }

  const sendCounterOffer = async () => {
    setSending(true)
    try {
      await api.post('/api/rides/counter-offer', { rideId: ride._id, amount: counterAmount })
      toast.success('Counter offer sent!')
      setShowCounter(false)
      setRidePopupPanel(false)
    } catch (err) {
      toast.error('Failed to send offer')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='px-5 pb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-[22px] font-bold text-gray-900'>New Ride Request</h3>
        <button onClick={() => setRidePopupPanel(false)} className='h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center'>
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Negotiable badge */}
      {isNegotiable && (
        <div className='bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 mb-4 text-center'>
          <p className='text-xs font-semibold text-amber-700 uppercase tracking-wider'>Negotiable Ride</p>
        </div>
      )}

      {/* Rider info */}
      <div className='flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4'>
        <div className='h-11 w-11 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0'>
          <span className='text-lg font-bold text-yellow-700 uppercase'>{ride?.user?.fullname?.firstname?.charAt(0)}</span>
        </div>
        <div className='flex-1'>
          <h2 className='text-base font-semibold text-gray-900 capitalize'>
            {ride?.user?.fullname?.firstname} {ride?.user?.fullname?.lastname}
          </h2>
          <p className='text-xs text-gray-500'>Rider</p>
        </div>
      </div>

      {/* Route */}
      <div className='bg-gray-50 rounded-2xl p-4 mb-4'>
        <div className='flex gap-3'>
          <div className='flex flex-col items-center pt-1.5'>
            <div className='h-3 w-3 rounded-full bg-emerald-500' />
            <div className='w-[2px] h-10 bg-gradient-to-b from-emerald-400 to-red-400 my-1' />
            <div className='h-3 w-3 rounded-sm bg-red-500' />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='pb-3'>
              <p className='text-[10px] uppercase tracking-wider text-gray-400 font-semibold'>Pickup</p>
              <p className='text-sm font-medium text-gray-800 truncate mt-0.5'>{ride?.pickup}</p>
            </div>
            <div className='pt-3 border-t border-gray-200'>
              <p className='text-[10px] uppercase tracking-wider text-gray-400 font-semibold'>Destination</p>
              <p className='text-sm font-medium text-gray-800 truncate mt-0.5'>{ride?.destination}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fare */}
      <div className='flex items-center justify-between bg-emerald-50 rounded-2xl p-4 mb-2'>
        <div className='flex items-center gap-2'>
          <Banknote size={18} className="text-emerald-600" />
          <span className='text-sm font-medium text-emerald-700'>
            {isNegotiable ? "Rider's Offer" : 'Earnings'}
          </span>
        </div>
        <span className='text-xl font-bold text-emerald-700'>
          Rs. {isNegotiable ? suggestedFare : ride?.fare}
        </span>
      </div>

      {isNegotiable && (
        <p className='text-xs text-gray-400 text-center mb-4'>Estimated fare: Rs. {ride?.fare}</p>
      )}

      {/* Counter Offer Section */}
      {showCounter && (
        <div className='bg-gray-900 rounded-2xl p-5 mb-4'>
          <p className='text-gray-400 text-xs text-center mb-3 uppercase tracking-wider font-medium'>Your Counter Offer</p>
          <div className='flex items-center justify-center gap-4'>
            <button onClick={() => adjustCounter(-10)} className='h-10 w-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform'>
              <Minus size={18} className="text-white" />
            </button>
            <span className='text-3xl font-bold text-white min-w-[120px] text-center'>Rs. {counterAmount}</span>
            <button onClick={() => adjustCounter(10)} className='h-10 w-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform'>
              <Plus size={18} className="text-white" />
            </button>
          </div>
          <button
            onClick={sendCounterOffer}
            disabled={sending}
            className='w-full mt-4 bg-emerald-500 text-white py-3 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-50'
          >
            {sending ? 'Sending...' : `Send Offer Rs. ${counterAmount}`}
          </button>
        </div>
      )}

      {/* Buttons */}
      <div className='space-y-2.5'>
        <button
          onClick={() => { setConfirmRidePopupPanel(true); confirmRide() }}
          className='w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2'
        >
          <Check size={20} />
          Accept {isNegotiable ? `Rs. ${suggestedFare}` : 'Ride'}
        </button>
        <button
          onClick={() => { setShowCounter(!showCounter); setCounterAmount(ride?.fare) }}
          className='w-full bg-amber-50 text-amber-700 border border-amber-200 py-3.5 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all'
        >
          {showCounter ? 'Hide Counter Offer' : 'Make Counter Offer'}
        </button>
        <button
          onClick={() => setRidePopupPanel(false)}
          className='w-full bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all'
        >
          Ignore
        </button>
      </div>
    </div>
  )
}

export default RidePopUp
