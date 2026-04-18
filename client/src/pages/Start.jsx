import React from 'react'
import { Link } from 'react-router-dom'
import { Car, MapPin, Shield, Star } from 'lucide-react'

const Start = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <div 
        className="h-screen bg-cover bg-center flex flex-col justify-between"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`
        }}
      >
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-2 rounded-md mr-3">
              <Car className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-white">Ride</span>
              <span className="text-orange-500">Nepal</span>
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center text-white max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Journey Through Nepal Starts Here</h2>
            <p className="text-xl mb-8">Experience the convenience of ride-sharing across the beautiful landscapes of Nepal</p>
            
            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col items-center">
                <MapPin className="text-orange-500 mb-2" size={28} />
                <span className="text-sm">Easy Booking</span>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="text-orange-500 mb-2" size={28} />
                <span className="text-sm">Safe Rides</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="text-orange-500 mb-2" size={28} />
                <span className="text-sm">Rated Drivers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className='bg-white p-6 rounded-t-2xl shadow-lg'>
          <h2 className='text-2xl font-bold mb-2 text-center'>Get Started with Ride_Nepal</h2>
          <p className="text-gray-600 text-center mb-6">Join thousands of riders exploring Nepal</p>
          
          <div className="flex flex-col gap-4">
            <Link 
              to='/signup' 
              className='flex items-center justify-center w-full bg-black text-white py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition duration-300'
            >
              Create Account
            </Link>
            
            <Link 
              to='/login' 
              className='flex items-center justify-center w-full border border-gray-300 text-black py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300'
            >
              Login
            </Link>
          </div>
          
          
        </div>
      </div>
    </div>
  )
}

export default Start