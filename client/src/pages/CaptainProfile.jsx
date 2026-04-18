import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'
import {
  ArrowLeft,
  ShipWheel,
  User,
  Mail,
  Bike,
  Car,
  Truck,
  Hash,
  Palette,
  Users,
  Home,
  History,
  LogOut,
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  CircleDot
} from 'lucide-react'

const CaptainProfile = () => {
    const { captain } = useAuthStore()
    const navigate = useNavigate()

    const getVehicleIcon = () => {
        switch(captain?.vehicle?.vehicleType) {
            case 'motorcycle':
                return <Bike className="text-blue-600" size={22} />
            case 'auto':
                return <Truck className="text-blue-600" size={22} />
            case 'car':
                return <Car className="text-blue-600" size={22} />
            default:
                return <Car className="text-blue-600" size={22} />
        }
    }

    const getStatusColor = () => {
        return captain?.status === 'active' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
            : 'bg-gradient-to-r from-gray-500 to-gray-600'
    }

    const getStatusText = () => {
        return captain?.status === 'active' ? 'Online' : 'Offline'
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
            {/* Hero Header Section */}
            <div className='relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <div className='relative px-5 pt-8 pb-12 sm:px-8 md:px-12'>
                    {/* Header Navigation */}
                    <div className='flex items-center justify-between mb-8'>
                        <button 
                            onClick={() => navigate('/captain-home')} 
                            className='h-11 w-11 bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95'
                        >
                            <ArrowLeft className="text-white" size={22} />
                        </button>
                        <h2 className='text-xl font-bold tracking-tight'>Captain Profile</h2>
                        <div className='w-11'></div>
                    </div>

                    {/* Profile Info */}
                    <div className='flex flex-col items-center'>
                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-60'></div>
                            <div className='relative h-28 w-28 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-4 border-white/20 shadow-2xl'>
                                <ShipWheel className="text-white" size={44} />
                            </div>
                        </div>
                        
                        <h2 className='text-3xl font-bold mt-5 capitalize tracking-tight'>
                            {captain?.fullname?.firstname} {captain?.fullname?.lastname}
                        </h2>
                        <p className='text-gray-300 mt-1 font-medium'>Professional Captain</p>
                        
                        <div className='flex gap-2 mt-3'>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor()} shadow-lg`}>
                                <span className="flex items-center gap-1.5">
                                    <CircleDot size={12} fill="currentColor" />
                                    {getStatusText()}
                                </span>
                            </span>
                        </div>

                        {/* Stats Cards */}
                        <div className='grid grid-cols-3 gap-3 w-full mt-8'>
                            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center'>
                                <Star size={18} className="mx-auto mb-1 text-yellow-400" />
                                <p className='text-lg font-bold'>4.9</p>
                                <p className='text-xs text-gray-300'>Rating</p>
                            </div>
                            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center'>
                                <TrendingUp size={18} className="mx-auto mb-1 text-green-400" />
                                <p className='text-lg font-bold'>156</p>
                                <p className='text-xs text-gray-300'>Trips</p>
                            </div>
                            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center'>
                                <Clock size={18} className="mx-auto mb-1 text-blue-400" />
                                <p className='text-lg font-bold'>98%</p>
                                <p className='text-xs text-gray-300'>On Time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className='px-5 py-8 sm:px-8 md:px-12 max-w-4xl mx-auto'>
                {/* Account Details */}
                <div className='mb-8'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <div className='w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full'></div>
                        Account Details
                    </h3>

                    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center'>
                                <User size={22} className="text-blue-600" />
                            </div>
                            <div>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Full Name</p>
                                <p className='text-base font-semibold text-gray-900 capitalize'>
                                    {captain?.fullname?.firstname} {captain?.fullname?.lastname || ''}
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-4 p-5 border-t border-gray-100 hover:bg-gray-50/50 transition-colors'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center'>
                                <Mail size={22} className="text-purple-600" />
                            </div>
                            <div>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Email Address</p>
                                <p className='text-base font-semibold text-gray-900'>{captain?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle Details */}
                <div className='mb-8'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <div className='w-1 h-6 bg-gradient-to-b from-green-500 to-teal-600 rounded-full'></div>
                        Vehicle Details
                    </h3>

                    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center'>
                                {getVehicleIcon()}
                            </div>
                            <div>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Vehicle Type</p>
                                <p className='text-base font-semibold text-gray-900 capitalize'>{captain?.vehicle?.vehicleType}</p>
                            </div>
                        </div>

                        <div className='flex items-center gap-4 p-5 border-t border-gray-100 hover:bg-gray-50/50 transition-colors'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center'>
                                <Hash size={22} className="text-orange-600" />
                            </div>
                            <div>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Plate Number</p>
                                <p className='text-base font-semibold text-gray-900 font-mono tracking-wider'>{captain?.vehicle?.plate}</p>
                            </div>
                        </div>

                        <div className='flex items-center gap-4 p-5 border-t border-gray-100 hover:bg-gray-50/50 transition-colors'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center'>
                                <Palette size={22} className="text-pink-600" />
                            </div>
                            <div>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Vehicle Color</p>
                                <p className='text-base font-semibold text-gray-900 capitalize'>{captain?.vehicle?.color}</p>
                            </div>
                        </div>

                        <div className='flex items-center gap-4 p-5 border-t border-gray-100 hover:bg-gray-50/50 transition-colors'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center'>
                                <Users size={22} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Seat Capacity</p>
                                <p className='text-base font-semibold text-gray-900'>{captain?.vehicle?.capacity} Passengers</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className='mb-8'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <div className='w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full'></div>
                        Quick Links
                    </h3>

                    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                        <Link to='/captain-home' className='flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors group'>
                            <div className='flex items-center gap-4'>
                                <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center'>
                                    <Home size={22} className="text-emerald-600" />
                                </div>
                                <p className='text-base font-semibold text-gray-900'>Dashboard</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <Link to='/captain/history' className='flex items-center justify-between p-5 border-t border-gray-100 hover:bg-gray-50/50 transition-colors group'>
                            <div className='flex items-center gap-4'>
                                <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center'>
                                    <History size={22} className="text-amber-600" />
                                </div>
                                <p className='text-base font-semibold text-gray-900'>Ride History & Earnings</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Edit Profile */}
                <button
                    onClick={() => navigate('/edit-profile', { state: { type: 'captain' } })}
                    className='w-full mb-3 bg-gray-900 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]'
                >
                    Edit Profile
                </button>

                {/* Logout Button */}
                <button
                    onClick={() => navigate('/captain/logout')}
                    className='w-full mb-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98]'
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    )
}

export default CaptainProfile