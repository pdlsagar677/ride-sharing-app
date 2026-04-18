import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'react-toastify'
import { MapPin, Flag, Banknote, CheckCircle, X } from 'lucide-react'

const FinishRide = (props) => {
    const navigate = useNavigate()

    async function endRide() {
        try {
            const response = await api.post('/api/rides/end-ride', {
                rideId: props.ride._id
            })

            if (response.status === 200) {
                toast.success('Ride completed!')
                navigate('/captain-home')
            }
        } catch (err) {
            toast.error('Failed to end ride')
        }
    }

    return (
        <div className='px-5 pb-6 pt-2'>
            <div className='flex items-center justify-between mb-4'>
                <h3 className='text-[22px] font-bold text-gray-900'>Finish Ride</h3>
                <button onClick={() => props.setFinishRidePanel(false)} className='h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center'>
                    <X size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Rider info */}
            <div className='flex items-center gap-3 bg-gray-50 rounded-2xl p-4 mb-4'>
                <div className='h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0'>
                    <span className='text-lg font-bold text-gray-600 uppercase'>
                        {props.ride?.user?.fullname?.firstname?.charAt(0)}
                    </span>
                </div>
                <div className='flex-1'>
                    <h2 className='text-base font-semibold capitalize'>{props.ride?.user?.fullname?.firstname}</h2>
                    <p className='text-xs text-gray-500'>Rider</p>
                </div>
            </div>

            {/* Route */}
            <div className='bg-gray-50 rounded-2xl p-4 mb-4'>
                <div className='flex gap-3'>
                    <div className='flex flex-col items-center pt-1.5'>
                        <div className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
                        <div className='w-[2px] h-7 bg-gray-200 my-1' />
                        <div className='h-2.5 w-2.5 rounded-sm bg-red-500' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm text-gray-700 truncate'>{props.ride?.pickup}</p>
                        <div className='h-4' />
                        <p className='text-sm text-gray-700 truncate'>{props.ride?.destination}</p>
                    </div>
                </div>
            </div>

            {/* Fare */}
            <div className='flex items-center justify-between bg-emerald-50 rounded-2xl p-4 mb-6'>
                <div className='flex items-center gap-2'>
                    <Banknote size={20} className="text-emerald-600" />
                    <span className='text-sm font-medium text-emerald-700'>Fare Collected</span>
                </div>
                <span className='text-xl font-bold text-emerald-700'>Rs. {props.ride?.fare}</span>
            </div>

            <button
                onClick={endRide}
                className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-semibold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2'
            >
                <CheckCircle size={20} />
                Complete & Finish Ride
            </button>
        </div>
    )
}

export default FinishRide
