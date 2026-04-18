import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'

const CaptainProtectWrapper = ({ children }) => {
    const { captain, isLoading, checkCaptainAuth } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        checkCaptainAuth().then((ok) => {
            if (!ok) navigate('/captain-login')
        })
    }, [])

    if (isLoading) {
        return (
            <div className='h-screen flex items-center justify-center'>
                <div className='h-8 w-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
            </div>
        )
    }

    if (!captain) return null

    return <>{children}</>
}

export default CaptainProtectWrapper
