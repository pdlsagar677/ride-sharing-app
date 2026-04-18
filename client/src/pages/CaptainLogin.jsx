import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'
import api from '../lib/axios'
import { Car, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'

const CaptainLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { setCaptain } = useAuthStore()
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/api/captain/login', { email, password })

      if (response.status === 200) {
        setCaptain(response.data.captain)
        toast.success('Captain login successful!', { autoClose: 1200 })
        navigate('/captain-home')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2600&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-black py-4 px-6">
          <Link to="/" className="flex items-center text-2xl font-bold">
            <div className="bg-green-600 p-2 rounded-md mr-3">
              <Car className="text-white" size={24} />
            </div>
            <span className="text-white">Ride</span>
            <span className="text-green-500">Captain</span>
          </Link>
        </div>

        <div className="px-8 py-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Captain Login</h1>
          <p className="text-gray-600 mb-6">Drive with RideNepal and earn</p>

          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500" type="email" placeholder="email@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input required className="pl-10 bg-gray-50 w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500" value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Enter your password" />
                <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-semibold rounded-lg px-4 py-3 text-lg hover:bg-green-600 transition duration-300">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <Link to='/forgot-password' state={{ type: 'captain' }} className="text-sm text-gray-500 hover:text-gray-700 block">Forgot Password?</Link>
            <p className="text-gray-600">
              New Rider? <Link to='/captain-signup' className="text-green-600 font-medium hover:underline">Join the Fleet</Link>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t">
          <p className="text-sm text-gray-600 text-center mb-3">Want to ride instead?</p>
          <Link to='/login' className='bg-orange-600 flex items-center justify-center text-white font-semibold rounded-lg px-4 py-3 w-full text-lg hover:bg-orange-700 transition duration-300'>
            User Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CaptainLogin
