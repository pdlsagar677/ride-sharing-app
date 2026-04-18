import React from 'react'

const icons = {
    motorcycle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <circle cx="5" cy="17" r="3" />
            <circle cx="19" cy="17" r="3" />
            <path d="M12 17V5l4 2-2 4h3l2 6" />
            <path d="M5 14h6" />
        </svg>
    ),
    car: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6A2 2 0 0 0 13.7 5H10a2 2 0 0 0-1.6.8L5.7 10 3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    ),
    auto: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M8 17h8" />
            <path d="M5 11l2-5h10l2 5" />
            <path d="M3 11h18v6H3z" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    ),
}

const colorMap = {
    motorcycle: { bg: 'bg-orange-50', text: 'text-orange-500', label: 'Motorcycle' },
    car: { bg: 'bg-blue-50', text: 'text-blue-500', label: 'Car' },
    auto: { bg: 'bg-green-50', text: 'text-green-500', label: 'Auto' },
}

const VehicleIcon = ({ type, size = 'md' }) => {
    const sizeMap = {
        sm: 'h-8 w-8 p-1.5',
        md: 'h-12 w-12 p-2.5',
        lg: 'h-16 w-16 p-3',
    }

    const colors = colorMap[type] || colorMap.car
    const icon = icons[type] || icons.car

    return (
        <div className={`${sizeMap[size]} ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <div className={colors.text}>
                {icon}
            </div>
        </div>
    )
}

export { colorMap }
export default VehicleIcon
