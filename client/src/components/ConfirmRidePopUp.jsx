import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { Shield, X, Loader } from 'lucide-react'

const ConfirmRidePopUp = ({ ride, setConfirmRidePopupPanel, setRidePopupPanel }) => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const navigate = useNavigate()

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    if (error) setError('')
  }

  const verifyOtp = async (e) => {
    if (e) e.preventDefault()
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP'); return }

    setIsVerifying(true)
    setError('')

    try {
      const response = await api.get('/api/rides/start-ride', {
          params: { rideId: ride._id, otp },
        }
      )

      if (response.status === 200) {
        setConfirmRidePopupPanel(false)
        setRidePopupPanel(false)
        navigate('/captain-riding', { state: { ride: response.data } })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setIsVerifying(false)
    }
  }

  if (!ride) return null

  return (
    <div className='px-5 pb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-[22px] font-bold text-gray-900'>Start Ride</h3>
        <button onClick={() => { setConfirmRidePopupPanel(false); setRidePopupPanel(true) }} className='h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center'>
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Ride Summary */}
      <div className='bg-gray-50 rounded-2xl p-4 mb-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center'>
              <span className='text-sm font-bold text-blue-600 uppercase'>{ride?.user?.fullname?.firstname?.charAt(0)}</span>
            </div>
            <p className='font-semibold text-gray-800 capitalize'>{ride?.user?.fullname?.firstname}</p>
          </div>
          <p className='text-lg font-bold text-gray-900'>Rs. {ride?.fare}</p>
        </div>
        <div className='space-y-2 text-sm'>
          <div className='flex items-start gap-2'>
            <div className='h-2 w-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0' />
            <span className='text-gray-600 truncate'>{ride?.pickup}</span>
          </div>
          <div className='flex items-start gap-2'>
            <div className='h-2 w-2 rounded-sm bg-red-500 mt-1.5 flex-shrink-0' />
            <span className='text-gray-600 truncate'>{ride?.destination}</span>
          </div>
        </div>
      </div>

      {/* OTP Section */}
      <div className='bg-gray-900 rounded-2xl p-5 mb-4'>
        <div className='flex items-center justify-center gap-2 mb-3'>
          <Shield size={14} className="text-emerald-400" />
          <p className='text-emerald-400 text-xs font-semibold uppercase tracking-wider'>Enter Rider's OTP</p>
        </div>

        <form onSubmit={verifyOtp}>
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={handleOtpChange}
            placeholder="------"
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-[28px] tracking-[0.5em] font-mono text-center text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors"
            maxLength={6}
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isVerifying ? <Loader size={18} className="animate-spin" /> : null}
            {isVerifying ? 'Verifying...' : 'Verify & Start'}
          </button>
        </form>
      </div>

      {/* Info */}
      <p className='text-xs text-gray-400 text-center'>Ask the rider for their 6-digit verification code to start the ride</p>

      {/* Cancel */}
      <button
        type="button"
        onClick={() => { setConfirmRidePopupPanel(false); setRidePopupPanel(false) }}
        className="w-full mt-4 bg-red-50 text-red-600 border border-red-200 py-3 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all"
      >
        Cancel
      </button>
    </div>
  )
}

export default ConfirmRidePopUp
