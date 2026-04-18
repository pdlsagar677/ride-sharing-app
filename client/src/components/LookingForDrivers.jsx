import React, { useState, useEffect } from 'react'
import { MapPin, Flag, Banknote, Loader } from 'lucide-react'

const LookingForDriver = (props) => {
    const [timeLeft, setTimeLeft] = useState(60)

    useEffect(() => {
        if (!props.ride?.createdAt) return
        const createdAt = new Date(props.ride.createdAt).getTime()
        const interval = setInterval(() => {
            const remaining = Math.max(60 - Math.floor((Date.now() - createdAt) / 1000), 0)
            setTimeLeft(remaining)
        }, 1000)
        return () => clearInterval(interval)
    }, [props.ride?.createdAt])

    return (
        <div className='px-5 pb-6'>
            {/* Searching animation */}
            <div className='flex flex-col items-center py-6'>
                <div className='relative'>
                    <div className='h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center'>
                        <Loader size={28} className="text-white animate-spin" />
                    </div>
                    <div className='absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full animate-pulse-dot' />
                </div>
                <h3 className='text-lg font-bold text-gray-900 mt-4'>Finding your driver</h3>
                <p className='text-sm text-gray-500 mt-1'>Matching you with nearby captains...</p>
            </div>

            {/* Route */}
            <div className='bg-gray-50 rounded-2xl p-4 mb-4'>
                <div className='flex gap-3'>
                    <div className='flex flex-col items-center pt-1.5'>
                        <div className='h-3 w-3 rounded-full bg-emerald-500' />
                        <div className='w-[2px] h-8 bg-gray-200 my-1' />
                        <div className='h-3 w-3 rounded-sm bg-red-500' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-800 truncate'>{props.pickup}</p>
                        <div className='h-5' />
                        <p className='text-sm font-medium text-gray-800 truncate'>{props.destination}</p>
                    </div>
                </div>
                <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-200'>
                    <span className='text-sm text-gray-500'>Fare</span>
                    <span className='text-base font-bold text-gray-900'>Rs. {props.fare[props.vehicleType]}</span>
                </div>
            </div>

            {/* Cancel */}
            {timeLeft > 0 ? (
                <button onClick={props.cancelRide} className='w-full bg-red-50 text-red-600 border border-red-200 py-3.5 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all'>
                    Cancel Ride ({timeLeft}s)
                </button>
            ) : (
                <p className='text-center text-sm text-gray-400 py-3'>Cancellation window expired</p>
            )}
        </div>
    )
}

export default LookingForDriver
