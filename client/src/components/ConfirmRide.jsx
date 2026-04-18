import React, { useState } from 'react'
import { Banknote, X, Minus, Plus } from 'lucide-react'
import VehicleIcon, { colorMap } from './VehicleIcon'

const ConfirmRide = (props) => {
    const vLabel = colorMap[props.vehicleType]?.label || props.vehicleType
    const baseFare = props.fare[props.vehicleType] || 0
    const [negotiable, setNegotiable] = useState(false)
    const [suggestedFare, setSuggestedFare] = useState(baseFare)

    const adjustFare = (amount) => {
        const newFare = suggestedFare + amount
        if (newFare >= Math.round(baseFare * 0.5) && newFare <= Math.round(baseFare * 2)) {
            setSuggestedFare(newFare)
        }
    }

    return (
        <div className='px-5 pb-6'>
            <div className='flex items-center justify-between mb-4'>
                <h3 className='text-[22px] font-bold text-gray-900'>Confirm ride</h3>
                <button onClick={() => props.setConfirmRidePanel(false)} className='h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center'>
                    <X size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Selected Vehicle */}
            <div className='flex items-center gap-3 mb-4'>
                <VehicleIcon type={props.vehicleType} size="sm" />
                <span className='text-sm font-semibold text-gray-700'>{vLabel}</span>
            </div>

            {/* Route */}
            <div className='bg-gray-50 rounded-2xl p-4 mb-4'>
                <div className='flex gap-3'>
                    <div className='flex flex-col items-center pt-1.5'>
                        <div className='h-3 w-3 rounded-full bg-emerald-500' />
                        <div className='w-[2px] h-10 bg-gradient-to-b from-emerald-400 to-red-400 my-1' />
                        <div className='h-3 w-3 rounded-sm bg-red-500' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <div className='pb-3'>
                            <p className='text-[10px] uppercase tracking-wider text-gray-400 font-semibold'>Pickup</p>
                            <p className='text-sm font-medium text-gray-800 truncate mt-0.5'>{props.pickup}</p>
                        </div>
                        <div className='pt-3 border-t border-gray-200'>
                            <p className='text-[10px] uppercase tracking-wider text-gray-400 font-semibold'>Destination</p>
                            <p className='text-sm font-medium text-gray-800 truncate mt-0.5'>{props.destination}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fare Section */}
            <div className='mb-4'>
                {/* Estimated fare */}
                <div className='flex items-center justify-between bg-emerald-50 rounded-2xl p-4'>
                    <div className='flex items-center gap-2'>
                        <Banknote size={18} className="text-emerald-600" />
                        <span className='text-sm font-medium text-emerald-700'>Estimated Fare</span>
                    </div>
                    <span className='text-lg font-bold text-emerald-700'>Rs. {baseFare}</span>
                </div>

                {/* Toggle negotiation */}
                <button
                    onClick={() => { setNegotiable(!negotiable); setSuggestedFare(baseFare) }}
                    className={`w-full mt-2 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                        negotiable ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}
                >
                    {negotiable ? 'Cancel negotiation' : 'Set your own price'}
                </button>
            </div>

            {/* Fare Negotiation Slider */}
            {negotiable && (
                <div className='bg-gray-900 rounded-2xl p-5 mb-4'>
                    <p className='text-gray-400 text-xs text-center mb-3 uppercase tracking-wider font-medium'>Your Offer</p>
                    <div className='flex items-center justify-center gap-4'>
                        <button onClick={() => adjustFare(-10)} className='h-10 w-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform'>
                            <Minus size={18} className="text-white" />
                        </button>
                        <span className='text-3xl font-bold text-white min-w-[120px] text-center'>Rs. {suggestedFare}</span>
                        <button onClick={() => adjustFare(10)} className='h-10 w-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform'>
                            <Plus size={18} className="text-white" />
                        </button>
                    </div>
                    <p className='text-gray-500 text-xs text-center mt-2'>
                        Range: Rs. {Math.round(baseFare * 0.5)} - Rs. {Math.round(baseFare * 2)}
                    </p>
                </div>
            )}

            {/* Confirm Buttons */}
            <button
                onClick={() => {
                    props.setVehicleFound(true)
                    props.setConfirmRidePanel(false)
                    if (negotiable) {
                        props.createNegotiableRide(suggestedFare)
                    } else {
                        props.createRide()
                    }
                }}
                className='w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold text-base active:scale-[0.98] transition-all'
            >
                {negotiable ? `Offer Rs. ${suggestedFare}` : 'Confirm Ride'}
            </button>
        </div>
    )
}

export default ConfirmRide
