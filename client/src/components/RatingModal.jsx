import React, { useState } from 'react'
import { Star, X } from 'lucide-react'
import api from '../lib/axios'
import { toast } from 'react-toastify'

const RatingModal = ({ rideId, captainName, onClose }) => {
    const [rating, setRating] = useState(0)
    const [hoveredStar, setHoveredStar] = useState(0)
    const [review, setReview] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

    const handleSubmit = async () => {
        if (rating === 0) { toast.error('Please select a rating'); return }
        setIsSubmitting(true)

        try {
            await api.post('/api/rides/rate', { rideId, rating, review: review.trim() || undefined })
            toast.success('Thanks for your rating!')
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit rating')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='fixed inset-0 z-[200] flex items-center justify-center animate-overlay-in'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px]' onClick={onClose} />
            <div className='relative bg-white rounded-[28px] p-6 mx-4 max-w-sm w-full animate-fade-scale'>
                <button onClick={onClose} className='absolute top-4 right-4 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center'>
                    <X size={16} className="text-gray-500" />
                </button>

                <div className='text-center mb-6'>
                    <div className='h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                        <span className='text-2xl font-bold text-gray-600 uppercase'>{captainName?.charAt(0)}</span>
                    </div>
                    <h3 className='text-lg font-bold text-gray-900'>Rate your ride</h3>
                    <p className='text-sm text-gray-500'>How was your experience with {captainName}?</p>
                </div>

                {/* Stars */}
                <div className='flex justify-center gap-2 mb-2'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className='p-1 transition-transform active:scale-90'
                        >
                            <Star
                                size={36}
                                className={`transition-colors ${
                                    star <= (hoveredStar || rating)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-200'
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <p className='text-center text-sm font-medium text-gray-500 mb-4 h-5'>
                    {labels[hoveredStar || rating] || ''}
                </p>

                {/* Review */}
                <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder='Write a review (optional)'
                    className='w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:border-gray-400 mb-4'
                />

                <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className='w-full bg-gray-900 text-white py-3.5 rounded-2xl font-semibold active:scale-[0.98] transition-all disabled:bg-gray-300'
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
            </div>
        </div>
    )
}

export default RatingModal
