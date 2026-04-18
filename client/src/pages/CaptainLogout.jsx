import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'

export const CaptainLogout = () => {
    const navigate = useNavigate()
    const { logout } = useAuthStore()

    useEffect(() => {
        logout('captain').then(() => navigate('/captain-login'))
    }, [])

    return null
}

export default CaptainLogout
