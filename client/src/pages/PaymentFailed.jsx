import React from 'react'
import { useNavigate } from 'react-router-dom'

const PaymentFailed = () => {
    const navigate = useNavigate()

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
            <div className='bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center'>
                {/* Failure Icon */}
                <div className='h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <i className="ri-close-line text-4xl text-red-600"></i>
                </div>

                <h1 className='text-2xl font-bold text-gray-900 mb-2'>Payment Failed</h1>
                <p className='text-gray-500 mb-6'>Your eSewa payment could not be completed. Please try again or pay with cash.</p>

                <div className='space-y-3'>
                    <button
                        onClick={() => navigate(-1)}
                        className='w-full bg-[#60BB46] text-white font-semibold py-3 rounded-xl hover:bg-[#4fa338] transition-colors'
                    >
                        Try Again
                    </button>

                    <button
                        onClick={() => navigate('/home')}
                        className='w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors'
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PaymentFailed
