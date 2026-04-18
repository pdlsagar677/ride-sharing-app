import React from 'react'
import { X, Users } from 'lucide-react'
import VehicleIcon from './VehicleIcon'

const vehicles = [
    { key: 'motorcycle', name: 'Motorcycle', desc: 'Quick & affordable', seats: '1-2' },
    { key: 'car', name: 'Car', desc: 'Comfortable ride', seats: '1-4' },
    { key: 'auto', name: 'Auto', desc: 'Budget friendly', seats: '1-3' },
]

const VehiclePanel = (props) => {
    return (
        <div className='px-5 pb-6'>
            <div className='flex items-center justify-between mb-5'>
                <h3 className='text-[22px] font-bold text-gray-900'>Choose a ride</h3>
                <button onClick={() => props.setVehiclePanel(false)} className='h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center'>
                    <X size={16} className="text-gray-500" />
                </button>
            </div>

            <div className='space-y-2.5'>
                {vehicles.map((v) => (
                    <div
                        key={v.key}
                        onClick={() => {
                            props.setConfirmRidePanel(true)
                            props.selectVehicle(v.key)
                        }}
                        className='flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 cursor-pointer hover:border-gray-900 active:scale-[0.98] transition-all'
                    >
                        <VehicleIcon type={v.key} />
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2'>
                                <h4 className='font-semibold text-gray-900'>{v.name}</h4>
                                <span className='flex items-center gap-0.5 text-xs text-gray-400'>
                                    <Users size={12} />{v.seats}
                                </span>
                            </div>
                            <p className='text-xs text-gray-500 mt-0.5'>{v.desc}</p>
                        </div>
                        <div className='text-right flex-shrink-0'>
                            <p className='text-lg font-bold text-gray-900'>Rs. {props.fare[v.key]}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default VehiclePanel
