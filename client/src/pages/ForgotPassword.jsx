import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, KeyRound, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../lib/axios'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const type = location.state?.type || 'user'
    const loginPath = type === 'captain' ? '/captain-login' : '/login'

    const [step, setStep] = useState('email') // email → otp → done
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const sendOtp = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const endpoint = type === 'captain' ? '/api/captain/forgot-password' : '/api/users/forgot-password'
            const response = await api.post(endpoint, { email })
            setPreviewUrl(response.data.previewUrl)
            setStep('otp')
            toast.success('OTP sent to your email!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP')
        } finally {
            setIsLoading(false)
        }
    }

    const resetPassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        setIsLoading(true)
        try {
            const endpoint = type === 'captain' ? '/api/captain/reset-password' : '/api/users/reset-password'
            await api.post(endpoint, { email, otp, newPassword, confirmPassword })
            toast.success('Password reset! You can now login.')
            setStep('done')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='bg-white border-b border-gray-100 px-4 pt-12 pb-4 sm:px-6'>
                <div className='flex items-center gap-4'>
                    <button onClick={() => navigate(loginPath)} className='h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center'>
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h2 className='text-xl font-semibold text-gray-900'>Forgot Password</h2>
                </div>
            </div>

            <div className='px-4 py-6 sm:px-6 max-w-lg mx-auto'>
                {/* Step 1: Email */}
                {step === 'email' && (
                    <form onSubmit={sendOtp} className='space-y-5'>
                        <p className='text-sm text-gray-600'>Enter your email and we'll send you a verification code to reset your password.</p>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address</label>
                            <div className='relative'>
                                <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input value={email} onChange={e => setEmail(e.target.value)} required type='email' className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='email@example.com' />
                            </div>
                        </div>
                        <button type='submit' disabled={isLoading} className='w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold active:scale-[0.98] transition-all disabled:bg-gray-400'>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP + New Password */}
                {step === 'otp' && (
                    <form onSubmit={resetPassword} className='space-y-5'>
                        <div className='bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-sm text-emerald-700'>
                            OTP sent to <strong>{email}</strong>
                        </div>

                        {previewUrl && (
                            <div className='bg-blue-50 border border-blue-200 rounded-2xl p-3 text-sm'>
                                <p className='text-blue-700 font-medium mb-1'>Test Mode:</p>
                                <a href={previewUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 underline break-all text-xs'>{previewUrl}</a>
                            </div>
                        )}

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>OTP Code</label>
                            <div className='relative'>
                                <KeyRound size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} inputMode='numeric' className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:border-gray-400' placeholder='------' />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>New Password</label>
                            <div className='relative'>
                                <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} type={showPassword ? 'text' : 'password'} className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Min 6 characters' />
                                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-3 text-gray-400'>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm Password</label>
                            <div className='relative'>
                                <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} type='password' className='pl-10 w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400' placeholder='Re-enter password' />
                            </div>
                        </div>

                        <button type='submit' disabled={isLoading || otp.length !== 6 || !newPassword || newPassword !== confirmPassword} className='w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold active:scale-[0.98] transition-all disabled:bg-gray-300'>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <button type='button' onClick={() => setStep('email')} className='w-full text-gray-500 text-sm hover:text-gray-700'>
                            Back
                        </button>
                    </form>
                )}

                {/* Step 3: Success */}
                {step === 'done' && (
                    <div className='text-center py-10'>
                        <div className='h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <Lock size={28} className='text-emerald-600' />
                        </div>
                        <h3 className='text-lg font-bold text-gray-900 mb-2'>Password Reset!</h3>
                        <p className='text-sm text-gray-500 mb-6'>You can now login with your new password.</p>
                        <button onClick={() => navigate(loginPath)} className='bg-gray-900 text-white px-8 py-3 rounded-2xl font-semibold active:scale-[0.98]'>
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword
