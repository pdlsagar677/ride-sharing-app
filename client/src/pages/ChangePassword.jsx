import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../lib/axios'

const ChangePassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const type = location.state?.type || 'user'
    const backPath = type === 'captain' ? '/captain/profile' : '/user/profile'

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        setIsLoading(true)

        try {
            const endpoint = type === 'captain' ? '/api/captain/change-password' : '/api/users/change-password'
            await api.put(endpoint, { currentPassword, newPassword, confirmPassword })
            toast.success('Password changed successfully!')
            navigate(backPath)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='bg-white border-b border-gray-100 px-4 pt-12 pb-4 sm:px-6'>
                <div className='flex items-center gap-4'>
                    <button onClick={() => navigate(backPath)} className='h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center'>
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h2 className='text-xl font-semibold text-gray-900'>Change Password</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className='px-4 py-6 sm:px-6 max-w-lg mx-auto space-y-5'>
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Current Password</label>
                    <div className='relative'>
                        <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required type={showCurrent ? 'text' : 'password'} className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Enter current password' />
                        <button type='button' onClick={() => setShowCurrent(!showCurrent)} className='absolute right-3 top-3 text-gray-400'>
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>New Password</label>
                    <div className='relative'>
                        <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} type={showNew ? 'text' : 'password'} className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Min 6 characters' />
                        <button type='button' onClick={() => setShowNew(!showNew)} className='absolute right-3 top-3 text-gray-400'>
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm New Password</label>
                    <div className='relative'>
                        <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} type='password' className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Re-enter new password' />
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className='text-red-500 text-xs mt-1'>Passwords do not match</p>
                    )}
                </div>

                <button type='submit' disabled={isLoading || !currentPassword || !newPassword || newPassword !== confirmPassword} className='w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold active:scale-[0.98] transition-all disabled:bg-gray-300'>
                    {isLoading ? 'Changing...' : 'Change Password'}
                </button>
            </form>
        </div>
    )
}

export default ChangePassword
