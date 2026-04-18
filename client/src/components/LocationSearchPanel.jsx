import React from 'react'
import { MapPin, Search } from 'lucide-react'

const LocationSearchPanel = ({ suggestions, setPanelOpen, setVehiclePanel, setPickup, setDestination, activeField, onSuggestionSelect }) => {

    const handleSuggestionClick = (suggestion) => {
        const displayText = suggestion.description || suggestion
        if (activeField === 'pickup') setPickup(displayText)
        else if (activeField === 'destination') setDestination(displayText)
        // Pass full suggestion object (with coordinates) to parent
        if (onSuggestionSelect) onSuggestionSelect(activeField, suggestion)
    }

    if (!suggestions || suggestions.length === 0) {
        return (
            <div className='flex flex-col items-center py-8 text-gray-400'>
                <Search size={24} className="mb-2 opacity-40" />
                <p className='text-sm'>Type at least 3 characters to search</p>
            </div>
        )
    }

    return (
        <div className='space-y-1.5 mt-2'>
            {suggestions.map((elem, idx) => (
                <div
                    key={idx}
                    onClick={() => handleSuggestionClick(elem)}
                    className='flex items-start gap-3 p-3 rounded-2xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors'
                >
                    <div className='h-9 w-9 min-w-[36px] bg-gray-100 rounded-full flex items-center justify-center mt-0.5'>
                        <MapPin size={16} className="text-gray-500" />
                    </div>
                    <p className='text-[14px] font-medium text-gray-700 leading-snug pt-1.5 line-clamp-2'>{elem.description || elem}</p>
                </div>
            ))}
        </div>
    )
}

export default LocationSearchPanel
