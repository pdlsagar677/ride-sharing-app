import React, { useEffect, useContext, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SocketContext } from '../context/SocketContext'
import LiveTracking from '../components/LiveTracking'
import api from '../lib/axios'
import { toast } from 'react-toastify'
import { Home, Phone, MapPin, Banknote } from 'lucide-react'
import VehicleIcon from '../components/VehicleIcon'
import RatingModal from '../components/RatingModal'

const Riding = () => {
    const location = useLocation()
    const { ride } = location.state || {}
    const { socket } = useContext(SocketContext)
    const navigate = useNavigate()
    const [payingWith, setPayingWith] = useState(null) // null | 'esewa' | 'khalti'
    const formRef = useRef(null)
    const [esewaData, setEsewaData] = useState(null)
    const [esewaUrl, setEsewaUrl] = useState('')
    const [showRating, setShowRating] = useState(false)
    const [endedRideId, setEndedRideId] = useState(null)
    const [captainLocation, setCaptainLocation] = useState(null)

    useEffect(() => {
        socket.on("ride-ended", () => {
            setEndedRideId(ride?._id)
            setShowRating(true)
        })
        socket.on("captain-location-update", (location) => {
            setCaptainLocation(location)
        })
        return () => { socket.off("ride-ended"); socket.off("captain-location-update") }
    }, [socket, ride])

    useEffect(() => {
        if (esewaData && formRef.current) formRef.current.submit()
    }, [esewaData])

    const handleEsewaPayment = async () => {
        if (!ride?._id) return
        setPayingWith('esewa')
        try {
            const response = await api.post('/api/payment/esewa/initiate', { rideId: ride._id })
            setEsewaUrl(response.data.esewaUrl)
            setEsewaData(response.data.paymentData)
        } catch (err) {
            toast.error('Failed to initiate eSewa payment')
            setPayingWith(null)
        }
    }

    const handleKhaltiPayment = async () => {
        if (!ride?._id) return
        setPayingWith('khalti')
        try {
            const response = await api.post('/api/payment/khalti/initiate', { rideId: ride._id })
            // Khalti returns a payment URL - redirect to it
            window.location.href = response.data.paymentUrl
        } catch (err) {
            toast.error('Failed to initiate Khalti payment')
            setPayingWith(null)
        }
    }

    return (
        <div className='h-screen flex flex-col bg-gray-100'>
            {/* Top bar */}
            <div className='fixed top-0 left-0 right-0 z-20 px-4 pt-3 flex items-center justify-between'>
                <Link to='/home' className='h-11 w-11 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform'>
                    <Home size={18} className="text-gray-700" />
                </Link>
                <div className='bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5'>
                    <div className='h-2 w-2 bg-white rounded-full animate-pulse' />
                    Ride in progress
                </div>
            </div>

            {/* Map */}
            <div className='flex-1 min-h-0'>
                <LiveTracking
                    pickupCoords={ride?.pickupCoords}
                    destinationCoords={ride?.destinationCoords}
                    routePolyline={ride?.routePolyline}
                    captainLocation={captainLocation}
                />
            </div>

            {/* Bottom Card */}
            <div className='bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-5'>
                {/* Captain info */}
                <div className='flex items-center gap-3 mb-4'>
                    <VehicleIcon type={ride?.captain?.vehicle?.vehicleType} />
                    <div className='flex-1 min-w-0'>
                        <h2 className='text-base font-semibold text-gray-900 capitalize'>{ride?.captain?.fullname?.firstname}</h2>
                        <p className='text-xs text-gray-500'>{ride?.captain?.vehicle?.plate} - <span className='capitalize'>{ride?.captain?.vehicle?.vehicleType}</span></p>
                    </div>
                    <button className='h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center'>
                        <Phone size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* Route mini */}
                <div className='bg-gray-50 rounded-2xl p-3 mb-4'>
                    <div className='flex items-center gap-3'>
                        <MapPin size={16} className="text-red-500 flex-shrink-0" />
                        <p className='text-sm text-gray-700 truncate'>{ride?.destination}</p>
                    </div>
                </div>

                {/* Fare */}
                <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-2'>
                        <Banknote size={18} className="text-gray-500" />
                        <span className='text-sm text-gray-600'>Total Fare</span>
                    </div>
                    <span className='text-xl font-bold text-gray-900'>Rs. {ride?.fare}</span>
                </div>

                {/* Payment Buttons */}
                <div className='space-y-2.5'>
                    {/* eSewa */}
                    <button
                        onClick={handleEsewaPayment}
                        disabled={payingWith !== null}
                        className='w-full bg-[#60BB46] hover:bg-[#52a33b] text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 text-[15px]'
                    >
                        {payingWith === 'esewa' ? 'Redirecting to eSewa...' : `Pay with eSewa`}
                    </button>

                    {/* Khalti */}
                    <button
                        onClick={handleKhaltiPayment}
                        disabled={payingWith !== null}
                        className='w-full bg-[#5C2D91] hover:bg-[#4a2475] text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 text-[15px]'
                    >
                        {payingWith === 'khalti' ? 'Redirecting to Khalti...' : `Pay with Khalti`}
                    </button>
                </div>

                {/* Hidden eSewa form */}
                {esewaData && (
                    <form ref={formRef} action={esewaUrl} method="POST" className='hidden'>
                        <input type="hidden" name="amount" value={esewaData.amount} />
                        <input type="hidden" name="tax_amount" value={esewaData.tax_amount} />
                        <input type="hidden" name="total_amount" value={esewaData.total_amount} />
                        <input type="hidden" name="transaction_uuid" value={esewaData.transaction_uuid} />
                        <input type="hidden" name="product_code" value={esewaData.product_code} />
                        <input type="hidden" name="product_service_charge" value={esewaData.product_service_charge} />
                        <input type="hidden" name="product_delivery_charge" value={esewaData.product_delivery_charge} />
                        <input type="hidden" name="success_url" value={`${import.meta.env.VITE_API_BASE_URL}/api/payment/esewa/success`} />
                        <input type="hidden" name="failure_url" value={`${import.meta.env.VITE_API_BASE_URL}/api/payment/esewa/failure`} />
                        <input type="hidden" name="signed_field_names" value={esewaData.signed_field_names} />
                        <input type="hidden" name="signature" value={esewaData.signature} />
                    </form>
                )}
            </div>

            {/* Rating Modal - shown when ride ends */}
            {showRating && endedRideId && (
                <RatingModal
                    rideId={endedRideId}
                    captainName={ride?.captain?.fullname?.firstname}
                    onClose={() => { setShowRating(false); navigate('/home') }}
                />
            )}
        </div>
    )
}

export default Riding
