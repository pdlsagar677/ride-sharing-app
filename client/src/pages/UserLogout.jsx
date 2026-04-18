import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'

export const UserLogout = () => {
    const navigate = useNavigate()
    const { logout } = useAuthStore()

    useEffect(() => {
        logout('user').then(() => navigate('/login'))
    }, [])

    return null
}

export default UserLogout
