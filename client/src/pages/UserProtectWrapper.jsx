import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'

const UserProtectWrapper = ({ children }) => {
    const { user, isLoading, checkUserAuth } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        checkUserAuth().then((ok) => {
            if (!ok) navigate('/login')
        })
    }, [])

    if (isLoading) {
        return (
            <div className='h-screen flex items-center justify-center'>
                <div className='h-8 w-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
            </div>
        )
    }

    if (!user) return null

    return <>{children}</>
}

export default UserProtectWrapper
