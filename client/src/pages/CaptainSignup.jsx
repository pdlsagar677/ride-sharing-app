import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'
import api from '../lib/axios'
import { Eye, EyeOff, Car, User, Mail, Lock, Shield, Car as Vehicle, Palette, Hash, Users, KeyRound } from 'lucide-react'
import { toast } from 'react-toastify'

const CaptainSignup = () => {
  const navigate = useNavigate()
  const { setCaptain } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [vehicleColor, setVehicleColor] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleCapacity, setVehicleCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('')

  const [step, setStep] = useState('form') // 'form' or 'otp'
  const [otp, setOtp] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  // Step 1: Submit form
  const submitHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const captainData = {
      fullname: { firstname: firstName.trim(), lastname: lastName.trim() },
      email: email.trim(),
      password,
      vehicle: {
        color: vehicleColor.trim(),
        plate: vehiclePlate.trim(),
        capacity: Number(vehicleCapacity),
        vehicleType
      }
    }

    try {
      const response = await api.post(`/api/captain/register`, captainData)

      setPreviewUrl(response.data.previewUrl)
      setStep('otp')
      toast.success('OTP sent to your email!', { autoClose: 2000 })
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Invalid data. Please check your inputs.')
      } else {
        toast.error('Something went wrong, please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post(`/api/otp/verify`, {
        email, otp, userType: 'captain'
      })

      if (response.status === 200) {
        setCaptain(response.data.captain)
        toast.success('Captain account created!', { autoClose: 1200 })
        navigate('/captain-home')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const resendOtp = async () => {
    setIsLoading(true)
    try {
      const response = await api.post(`/api/otp/send`, {
        email, userType: 'captain'
      })
      setPreviewUrl(response.data.previewUrl)
      toast.success('OTP resent!', { autoClose: 1500 })
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-black py-4 px-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-2 rounded-md mr-3">
              <Car className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-white">Ride</span>
              <span className="text-orange-500">Nepal</span>
              <span className="text-white text-sm ml-2">Captain</span>
            </h1>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Step 1: Form */}
          {step === 'form' && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-gray-900">Become a Captain</h1>
              <p className="text-gray-600 mb-6">Join our team of professional drivers</p>

              <form onSubmit={submitHandler} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500" type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500" value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Create a strong password" />
                    <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Vehicle Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <div className="relative">
                        <Palette className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500" type="text" placeholder="Vehicle Color" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plate</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500" type="text" placeholder="License Plate" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500" type="number" placeholder="Seats" value={vehicleCapacity} onChange={(e) => setVehicleCapacity(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <div className="relative">
                        <Vehicle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 appearance-none" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                          <option value="" disabled>Select Type</option>
                          <option value="car">Car</option>
                          <option value="auto">Auto</option>
                          <option value="motorcycle">Motorcycle</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Shield className="text-orange-500 mr-2" size={16} />
                  <span className="text-gray-600">Your information is securely stored</span>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-semibold rounded-lg px-4 py-3 text-lg hover:bg-orange-600 transition duration-300">
                  {isLoading ? 'Creating account...' : 'Create Captain Account'}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600">
                Already have an account? <Link to='/captain-login' className="text-orange-600 font-medium hover:underline">Login here</Link>
              </p>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-gray-900">Verify your email</h1>
              <p className="text-gray-600 mb-6">We've sent a 6-digit code to <strong>{email}</strong></p>

              {previewUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm mb-4">
                  <p className="text-blue-700 font-medium mb-1">Test Mode - View OTP Email:</p>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all text-xs">{previewUrl}</a>
                </div>
              )}

              <form onSubmit={verifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 text-center text-xl tracking-[0.4em] font-mono" type="text" inputMode="numeric" maxLength={6} placeholder="------" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full bg-black text-white font-semibold rounded-lg px-4 py-3 text-lg hover:bg-orange-600 transition duration-300 disabled:bg-gray-400">
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={resendOtp} disabled={isLoading} className="text-orange-600 hover:underline">Resend OTP</button>
                  <button type="button" onClick={() => { setStep('form'); setOtp('') }} className="text-gray-500 hover:text-gray-700">Back</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaptainSignup
