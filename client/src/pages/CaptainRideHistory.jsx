import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin,
  User,
  CreditCard,
  DollarSign,
  Circle,
  Loader2,
  Car,
  Award
} from 'lucide-react'

const CaptainRideHistory = () => {
    const [rides, setRides] = useState([])
    const [totalEarnings, setTotalEarnings] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/api/rides/captain-history')
                setRides(response.data.rides)
                setTotalEarnings(response.data.totalEarnings)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHistory()
    }, [])

    const completedRides = rides.filter(r => r.status === 'completed')
    const cancelledRides = rides.filter(r => r.status === 'cancelled')
    const avgPerRide = completedRides.length > 0 ? Math.round(totalEarnings / completedRides.length) : 0

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const formatTime = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 pt-12 pb-6 sm:px-6'>
                <div className='flex items-center gap-4 mb-6'>
                    <button 
                        onClick={() => navigate('/captain-home')} 
                        className='h-10 w-10 bg-white/10 hover:bg-white/20 flex items-center justify-center rounded-full transition-colors'
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className='text-xl font-semibold'>Ride History</h2>
                </div>

                {/* Earnings Card */}
                <div className='bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <DollarSign size={18} className="text-emerald-200" />
                        <p className='text-emerald-100 text-sm'>Total Earnings</p>
                    </div>
                    <h1 className='text-3xl font-bold'>रु {totalEarnings.toLocaleString()}</h1>
                    
                    <div className='grid grid-cols-3 gap-4 mt-5'>
                        <div>
                            <p className='text-emerald-100 text-xs mb-1'>Completed</p>
                            <div className='flex items-center gap-1'>
                                <CheckCircle size={14} className="text-emerald-300" />
                                <p className='text-white text-lg font-semibold'>{completedRides.length}</p>
                            </div>
                        </div>
                        <div>
                            <p className='text-emerald-100 text-xs mb-1'>Cancelled</p>
                            <div className='flex items-center gap-1'>
                                <XCircle size={14} className="text-red-300" />
                                <p className='text-white text-lg font-semibold'>{cancelledRides.length}</p>
                            </div>
                        </div>
                        <div>
                            <p className='text-emerald-100 text-xs mb-1'>Avg / Ride</p>
                            <div className='flex items-center gap-1'>
                                <TrendingUp size={14} className="text-emerald-300" />
                                <p className='text-white text-lg font-semibold'>रु {avgPerRide}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ride List */}
            <div className='px-4 py-4 sm:px-6 max-w-2xl mx-auto'>
                {isLoading ? (
                    <div className='flex flex-col items-center justify-center py-20'>
                        <Loader2 size={40} className="text-gray-400 animate-spin" />
                        <p className='text-gray-500 mt-4'>Loading history...</p>
                    </div>
                ) : rides.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20'>
                        <div className='h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                            <Car size={32} className="text-gray-400" />
                        </div>
                        <h3 className='text-lg font-medium text-gray-700'>No rides yet</h3>
                        <p className='text-gray-400 text-sm mt-1'>Your completed rides will appear here</p>
                        <button 
                            onClick={() => navigate('/captain-home')} 
                            className='mt-6 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors'
                        >
                            Go Online
                        </button>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {rides.map((ride) => (
                            <div key={ride._id} className='bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'>
                                {/* Status Bar */}
                                <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
                                    ride.status === 'completed' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                                }`}>
                                    <div className='flex items-center gap-2'>
                                        <Circle size={8} className={`${ride.status === 'completed' ? 'text-emerald-500' : 'text-red-500'} fill-current`} />
                                        <span className={`text-xs font-semibold uppercase ${
                                            ride.status === 'completed' ? 'text-emerald-700' : 'text-red-700'
                                        }`}>{ride.status}</span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        {ride.status === 'completed' && (
                                            <span className='text-sm font-bold text-emerald-600 flex items-center gap-1'>
                                                <TrendingUp size={12} />
                                                +रु {ride.fare}
                                            </span>
                                        )}
                                        <div className='flex items-center gap-2 text-xs text-gray-500'>
                                            <Calendar size={12} />
                                            {formatDate(ride.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* Ride Details */}
                                <div className='p-4'>
                                    {/* Route */}
                                    <div className='flex gap-3'>
                                        <div className='flex flex-col items-center'>
                                            <div className='h-2 w-2 rounded-full bg-emerald-500'></div>
                                            <div className='w-0.5 h-10 bg-gray-200 my-1'></div>
                                            <div className='h-2 w-2 rounded-full bg-red-500'></div>
                                        </div>
                                        <div className='flex-1 space-y-4'>
                                            <div>
                                                <p className='text-xs text-gray-500 mb-0.5'>Pickup</p>
                                                <p className='text-sm font-medium text-gray-800'>{ride.pickup}</p>
                                            </div>
                                            <div>
                                                <p className='text-xs text-gray-500 mb-0.5'>Destination</p>
                                                <p className='text-sm font-medium text-gray-800'>{ride.destination}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer & Payment */}
                                    <div className='mt-4 pt-3 border-t border-gray-100 flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <div className='h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center'>
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <p className='text-sm font-medium text-gray-800 capitalize'>
                                                    {ride.user?.fullname?.firstname || 'Guest'}
                                                </p>
                                                <div className='flex items-center gap-1'>
                                                    <Clock size={10} className="text-gray-400" />
                                                    <p className='text-xs text-gray-400'>{formatTime(ride.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <p className='text-lg font-bold text-gray-900'>रु {ride.fare}</p>
                                            <p className='text-xs text-gray-400 capitalize flex items-center gap-1 justify-end'>
                                                <CreditCard size={10} />
                                                {ride.paymentMethod || 'cash'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CaptainRideHistory