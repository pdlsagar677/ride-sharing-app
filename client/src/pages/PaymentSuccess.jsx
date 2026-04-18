import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentSuccess = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const rideId = searchParams.get('rideId')

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home')
        }, 4000)
        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
            <div className='bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center'>
                {/* Success Icon */}
                <div className='h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <i className="ri-check-line text-4xl text-green-600"></i>
                </div>

                <h1 className='text-2xl font-bold text-gray-900 mb-2'>Payment Successful!</h1>
                <p className='text-gray-500 mb-6'>Your eSewa payment has been completed successfully.</p>

                {rideId && (
                    <p className='text-xs text-gray-400 mb-4'>Ride ID: {rideId}</p>
                )}

                <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-6'>
                    <p className='text-sm text-green-700'>Your captain has been notified about the payment.</p>
                </div>

                <button
                    onClick={() => navigate('/home')}
                    className='w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors'
                >
                    Back to Home
                </button>

                <p className='text-xs text-gray-400 mt-4'>Redirecting automatically in a few seconds...</p>
            </div>
        </div>
    )
}

export default PaymentSuccess
