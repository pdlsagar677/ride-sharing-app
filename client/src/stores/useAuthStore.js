import { create } from 'zustand'
import api from '../lib/axios'

const useAuthStore = create((set) => ({
    user: null,
    captain: null,
    role: null, 
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => set({ user, role: 'user', isAuthenticated: true, isLoading: false }),
    setCaptain: (captain) => set({ captain, role: 'captain', isAuthenticated: true, isLoading: false }),

    // Check if user is authenticated by calling profile API (cookie sent automatically)
    checkUserAuth: async () => {
        try {
            const response = await api.get('/api/users/profile')
            set({ user: response.data, role: 'user', isAuthenticated: true, isLoading: false })
            return true
        } catch {
            set({ user: null, role: null, isAuthenticated: false, isLoading: false })
            return false
        }
    },

    checkCaptainAuth: async () => {
        try {
            const response = await api.get('/api/captain/profile')
            set({ captain: response.data.captain, role: 'captain', isAuthenticated: true, isLoading: false })
            return true
        } catch {
            set({ captain: null, role: null, isAuthenticated: false, isLoading: false })
            return false
        }
    },

    logout: async (type = 'user') => {
        try {
            const endpoint = type === 'captain' ? '/api/captain/logout' : '/api/users/logout'
            await api.get(endpoint)
        } catch {
            // ignore errors on logout
        }
        set({ user: null, captain: null, role: null, isAuthenticated: false, isLoading: false })
    },
}))

export default useAuthStore
