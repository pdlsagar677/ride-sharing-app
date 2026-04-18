import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, User, Phone, Palette, Hash, Users, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../stores/useAuthStore'
import api from '../lib/axios'

const EditProfile = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const type = location.state?.type || 'user' // 'user' or 'captain'
    const { user, captain, setUser, setCaptain } = useAuthStore()

    const data = type === 'captain' ? captain : user
    const backPath = type === 'captain' ? '/captain/profile' : '/user/profile'

    const [firstName, setFirstName] = useState(data?.fullname?.firstname || '')
    const [lastName, setLastName] = useState(data?.fullname?.lastname || '')
    const [phone, setPhone] = useState(data?.phone || '')
    const [vehicleColor, setVehicleColor] = useState(data?.vehicle?.color || '')
    const [vehiclePlate, setVehiclePlate] = useState(data?.vehicle?.plate || '')
    const [vehicleCapacity, setVehicleCapacity] = useState(data?.vehicle?.capacity || '')
    const [isLoading, setIsLoading] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const { logout } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const endpoint = type === 'captain' ? '/api/captain/profile' : '/api/users/profile'
            const body = { firstname: firstName, lastname: lastName, phone }

            if (type === 'captain') {
                body.vehicleColor = vehicleColor
                body.vehiclePlate = vehiclePlate
                body.vehicleCapacity = Number(vehicleCapacity)
            }

            const response = await api.put(endpoint, body)

            if (type === 'captain') {
                setCaptain(response.data.captain)
            } else {
                setUser(response.data)
            }

            toast.success('Profile updated!')
            navigate(backPath)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white border-b border-gray-100 px-4 pt-12 pb-4 sm:px-6'>
                <div className='flex items-center gap-4'>
                    <button onClick={() => navigate(backPath)} className='h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center'>
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h2 className='text-xl font-semibold text-gray-900'>Edit Profile</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className='px-4 py-6 sm:px-6 max-w-lg mx-auto space-y-5'>
                {/* Email - read only */}
                <div>
                    <label className='block text-sm font-medium text-gray-500 mb-1'>Email (cannot change)</label>
                    <div className='bg-gray-100 px-4 py-3 rounded-2xl text-gray-500 text-sm'>
                        {data?.email}
                    </div>
                </div>

                {/* Name */}
                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>First Name</label>
                        <div className='relative'>
                            <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input value={firstName} onChange={e => setFirstName(e.target.value)} required className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='First name' />
                        </div>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name</label>
                        <div className='relative'>
                            <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input value={lastName} onChange={e => setLastName(e.target.value)} className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Last name' />
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                    <div className='relative'>
                        <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input value={phone} onChange={e => setPhone(e.target.value)} className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='+977 98XXXXXXXX' />
                    </div>
                </div>

                {/* Captain vehicle fields */}
                {type === 'captain' && (
                    <>
                        <div className='pt-4 border-t border-gray-200'>
                            <h3 className='text-base font-semibold text-gray-800 mb-4'>Vehicle Details</h3>
                            <div className='space-y-3'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle Color</label>
                                    <div className='relative'>
                                        <Palette size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input value={vehicleColor} onChange={e => setVehicleColor(e.target.value)} className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Vehicle color' />
                                    </div>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Plate Number</label>
                                    <div className='relative'>
                                        <Hash size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Ba 1 Pa 1234' />
                                    </div>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Seat Capacity</label>
                                    <div className='relative'>
                                        <Users size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input type='number' value={vehicleCapacity} onChange={e => setVehicleCapacity(e.target.value)} className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Capacity' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <button type='submit' disabled={isLoading} className='w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold active:scale-[0.98] transition-all disabled:bg-gray-400'>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>

                {/* Change Password Link */}
                <button type='button' onClick={() => navigate('/change-password', { state: { type } })} className='w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all'>
                    Change Password
                </button>

                {/* Delete Account */}
                <div className='pt-6 border-t border-gray-200 mt-6'>
                    {!showDelete ? (
                        <button type='button' onClick={() => setShowDelete(true)} className='w-full flex items-center justify-center gap-2 text-red-500 text-sm font-medium py-3 hover:text-red-700'>
                            <Trash2 size={16} />
                            Delete My Account
                        </button>
                    ) : (
                        <div className='bg-red-50 border border-red-200 rounded-2xl p-4'>
                            <p className='text-sm font-semibold text-red-700 mb-1'>Delete Account?</p>
                            <p className='text-xs text-red-500 mb-3'>This will permanently delete your account, ride history, and all data. This cannot be undone.</p>
                            <input
                                value={deletePassword}
                                onChange={e => setDeletePassword(e.target.value)}
                                type='password'
                                placeholder='Enter your password to confirm'
                                className='w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-red-400'
                            />
                            <div className='flex gap-2'>
                                <button
                                    type='button'
                                    onClick={() => { setShowDelete(false); setDeletePassword('') }}
                                    className='flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-semibold'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    disabled={!deletePassword || isDeleting}
                                    onClick={async () => {
                                        setIsDeleting(true)
                                        try {
                                            const endpoint = type === 'captain' ? '/api/captain/delete-account' : '/api/users/delete-account'
                                            await api.delete(endpoint, { data: { password: deletePassword } })
                                            toast.success('Account deleted')
                                            await logout(type)
                                            navigate(type === 'captain' ? '/captain-login' : '/login')
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || 'Failed to delete account')
                                        } finally {
                                            setIsDeleting(false)
                                        }
                                    }}
                                    className='flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:bg-red-300'
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Forever'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}

export default EditProfile
