import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../stores/useAuthStore'
import { Eye, EyeOff, Car, User, Mail, Lock, Shield, KeyRound } from 'lucide-react'
import { toast } from 'react-toastify'

const UserSignup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' or 'otp'
  const [otp, setOtp] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const submitHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/api/users/register', {
        fullname: { firstname: firstName, lastname: lastName },
        email,
        password
      })

      setPreviewUrl(response.data.previewUrl)
      setStep('otp')
      toast.success('OTP sent to your email!', { autoClose: 2000 })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/api/otp/verify', {
        email, otp, userType: 'user'
      })

      if (response.status === 200) {
        setUser(response.data.user)
        toast.success('Account created successfully!', { autoClose: 1200 })
        navigate('/home')
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
      const response = await api.post('/api/otp/send', {
        email, userType: 'user'
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f97316"/></svg>')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-black py-4 px-6">
          <Link to="/" className="flex items-center text-2xl font-bold">
            <div className="bg-orange-500 p-2 rounded-md mr-3">
              <Car className="text-white" size={24} />
            </div>
            <span className="text-white">Ride</span>
            <span className="text-orange-500">Nepal</span>
          </Link>
        </div>

        <div className="px-8 py-8">
          {/* Step 1: Signup Form */}
          {step === 'form' && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-gray-900">Create your account</h1>
              <p className="text-gray-600 mb-6">Join Nepal's premier ride-sharing service</p>

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

                <div className="flex items-center text-sm">
                  <Shield className="text-orange-500 mr-2" size={16} />
                  <span className="text-gray-600">Your data is securely encrypted</span>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-semibold rounded-lg px-4 py-3 text-lg hover:bg-orange-600 transition duration-300">
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600">
                Already have an account? <Link to='/login' className="text-orange-600 font-medium hover:underline">Login here</Link>
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

        {/* Captain Section */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          <p className="text-sm text-gray-600 text-center mb-3">Are you a Captain?</p>
          <Link to="/captain-signup" className="block text-center px-4 py-2 bg-black text-white rounded-lg hover:bg-orange-600 transition">Captain Signup</Link>
        </div>
      </div>
    </div>
  )
}

export default UserSignup
