import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  History, 
  LogOut,
  Star,
  Calendar,
  CreditCard,
  Award,
  TrendingUp,
  Circle,
  UserCircle2,
  MapPin,
  Clock
} from 'lucide-react'

const UserProfile = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    // Mock stats - in real app, fetch from API
    const userStats = {
        totalRides: 42,
        totalSpent: 12580,
        rating: 4.8,
        joinedDate: '2024-01-15'
    }

    // Mock ride history - just 2 recent rides
    const recentRides = [
        {
            id: 1,
            from: 'Thamel, Kathmandu',
            to: 'Airport, Kathmandu',
            date: '2024-01-20',
            time: '10:30 AM',
            fare: 450,
            status: 'completed'
        },
        {
            id: 2,
            from: 'Lakeside, Pokhara',
            to: 'Bus Park, Pokhara',
            date: '2024-01-18',
            time: '2:15 PM',
            fare: 320,
            status: 'completed'
        }
    ]

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        return new Date(dateString).toLocaleDateString(undefined, options)
    }

    const formatCurrency = (amount) => {
        return `रु ${amount}`
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
            {/* Hero Header Section */}
            <div className='relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white'>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"></div>
                
                <div className='relative px-5 pt-8 pb-12 sm:px-8 md:px-12'>
                    {/* Header Navigation */}
                    <div className='flex items-center justify-between mb-8'>
                        <button 
                            onClick={() => navigate('/home')} 
                            className='h-11 w-11 bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95'
                        >
                            <ArrowLeft className="text-white" size={22} />
                        </button>
                        <h2 className='text-xl font-bold tracking-tight'>My Profile</h2>
                        <div className='w-11'></div>
                    </div>

                    {/* Profile Info */}
                    <div className='flex flex-col items-center'>
                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-60'></div>
                            <div className='relative h-28 w-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-4 border-white/20 shadow-2xl'>
                                <UserCircle2 className="text-white" size={48} />
                            </div>
                        </div>
                        
                        <h2 className='text-3xl font-bold mt-5 capitalize tracking-tight'>
                            {user?.fullname?.firstname} {user?.fullname?.lastname}
                        </h2>
                        <p className='text-blue-200 mt-1 font-medium'>Premium Rider</p>
                        
                        <div className='flex gap-2 mt-3'>
                            <span className='px-4 py-1.5 rounded-full text-sm font-semibold bg-green-500/20 text-green-300 backdrop-blur-sm'>
                                <span className="flex items-center gap-1.5">
                                    <Circle size={12} fill="currentColor" />
                                    Active
                                </span>
                            </span>
                        </div>

                        {/* Stats Cards */}
                        <div className='grid grid-cols-3 gap-3 w-full mt-8'>
                            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center'>
                                <TrendingUp size={18} className="mx-auto mb-1 text-green-400" />
                                <p className='text-lg font-bold'>{userStats.totalRides}</p>
                                <p className='text-xs text-blue-200'>Total Rides</p>
                            </div>
                            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center'>
                                <Star size={18} className="mx-auto mb-1 text-yellow-400" />
                                <p className='text-lg font-bold'>{userStats.rating}</p>
                                <p className='text-xs text-blue-200'>Rating</p>
                            </div>
                            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center'>
                                <CreditCard size={18} className="mx-auto mb-1 text-blue-400" />
                                <p className='text-lg font-bold'>{formatCurrency(userStats.totalSpent)}</p>
                                <p className='text-xs text-blue-200'>Total Spent</p>
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
                        <div className='w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full'></div>
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
                                    {user?.fullname?.firstname} {user?.fullname?.lastname || ''}
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-4 p-5 border-t border-gray-100 hover:bg-gray-50/50 transition-colors'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center'>
                                <Mail size={22} className="text-purple-600" />
                            </div>
                            <div>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Email Address</p>
                                <p className='text-base font-semibold text-gray-900'>{user?.email}</p>
                            </div>
                        </div>

                        <div className='flex items-center gap-4 p-5 border-t border-gray-100 hover:bg-gray-50/50 transition-colors'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center'>
                                <Calendar size={22} className="text-green-600" />
                            </div>
                            <div>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Member Since</p>
                                <p className='text-base font-semibold text-gray-900'>{formatDate(userStats.joinedDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Rides Section - Only 2 rides */}
                <div className='mb-8'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                            <div className='w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full'></div>
                            Recent Rides
                        </h3>
                        <Link to='/user/history' className='text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1'>
                            View All
                            <History size={14} />
                        </Link>
                    </div>

                    <div className='space-y-3'>
                        {recentRides.map((ride) => (
                            <div key={ride.id} className='bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow'>
                                <div className='flex items-start justify-between mb-3'>
                                    <div className='flex items-center gap-2'>
                                        <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center'>
                                            <Award size={16} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className='text-xs text-gray-500'>{ride.date} • {ride.time}</p>
                                        </div>
                                    </div>
                                    <span className='text-sm font-bold text-gray-900'>{formatCurrency(ride.fare)}</span>
                                </div>
                                
                                <div className='space-y-2 pl-10'>
                                    <div className='flex items-start gap-2'>
                                        <MapPin size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className='text-xs text-gray-500'>From</p>
                                            <p className='text-sm font-medium text-gray-800'>{ride.from}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-start gap-2'>
                                        <MapPin size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className='text-xs text-gray-500'>To</p>
                                            <p className='text-sm font-medium text-gray-800'>{ride.to}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 pt-1'>
                                        <Clock size={12} className="text-gray-400" />
                                        <p className='text-xs text-gray-500'>Completed</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Edit Profile */}
                <button
                    onClick={() => navigate('/edit-profile', { state: { type: 'user' } })}
                    className='w-full mb-3 bg-gray-900 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]'
                >
                    Edit Profile
                </button>

                {/* Logout Button */}
                <button
                    onClick={() => navigate('/user/logout')}
                    className='w-full mb-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98]'
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    )
}

export default UserProfile