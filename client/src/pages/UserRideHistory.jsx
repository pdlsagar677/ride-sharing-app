import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { 
  ArrowLeft, 
  Route, 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation,
  User,
  CreditCard,
  Circle,
  Loader2,
  Car
} from 'lucide-react'

const UserRideHistory = () => {
    const [rides, setRides] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/api/rides/user-history')
                setRides(response.data)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHistory()
    }, [])

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
            {/* Simple Header */}
            <div className='bg-white border-b border-gray-100 px-4 pt-12 pb-4 sm:px-6'>
                <div className='flex items-center gap-4'>
                    <button 
                        onClick={() => navigate('/home')} 
                        className='h-10 w-10 bg-gray-100 hover:bg-gray-200 flex items-center justify-center rounded-full transition-colors'
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <div>
                        <h2 className='text-xl font-semibold text-gray-900'>My Rides</h2>
                        <p className='text-sm text-gray-500 mt-0.5'>{rides.length} ride{rides.length !== 1 ? 's' : ''} total</p>
                    </div>
                </div>
            </div>

            {/* Ride List */}
            <div className='px-4 py-4 sm:px-6 max-w-2xl mx-auto'>
                {isLoading ? (
                    <div className='flex flex-col items-center justify-center py-20'>
                        <Loader2 size={40} className="text-gray-400 animate-spin" />
                        <p className='text-gray-500 mt-4'>Loading rides...</p>
                    </div>
                ) : rides.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20'>
                        <div className='h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                            <Route size={32} className="text-gray-400" />
                        </div>
                        <h3 className='text-lg font-medium text-gray-700'>No rides yet</h3>
                        <p className='text-gray-400 text-sm mt-1'>Your completed rides will appear here</p>
                        <button 
                            onClick={() => navigate('/home')} 
                            className='mt-6 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors'
                        >
                            Book a Ride
                        </button>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {rides.map((ride) => (
                            <div key={ride._id} className='bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'>
                                {/* Ride Header */}
                                <div className='px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <Circle size={8} className={`${ride.status === 'completed' ? 'text-green-500' : 'text-red-500'} fill-current`} />
                                        <span className={`text-xs font-medium uppercase ${ride.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                                            {ride.status}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-3 text-xs text-gray-500'>
                                        <span className='flex items-center gap-1'>
                                            <Calendar size={12} />
                                            {formatDate(ride.createdAt)}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <Clock size={12} />
                                            {formatTime(ride.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Ride Route */}
                                <div className='p-4'>
                                    <div className='flex gap-3'>
                                        <div className='flex flex-col items-center'>
                                            <div className='h-2 w-2 rounded-full bg-green-500'></div>
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

                                    {/* Ride Details */}
                                    <div className='mt-4 pt-3 border-t border-gray-100 flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <div className='h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center'>
                                                {ride.captain ? (
                                                    <User size={16} className="text-gray-600" />
                                                ) : (
                                                    <Car size={16} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                {ride.captain ? (
                                                    <>
                                                        <p className='text-sm font-medium text-gray-800 capitalize'>
                                                            {ride.captain?.fullname?.firstname}
                                                        </p>
                                                        <p className='text-xs text-gray-400'>{ride.captain?.vehicle?.plate}</p>
                                                    </>
                                                ) : (
                                                    <p className='text-sm text-gray-400'>No driver assigned</p>
                                                )}
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

export default UserRideHistory