import React, { useEffect, useRef, useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/axios'
import { Menu, X, User, Clock, LogOut, MapPin, Search, ChevronDown, Minus, Plus } from 'lucide-react'
import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'
import LookingForDriver from '../components/LookingForDrivers'
import WaitingForDriver from '../components/WaitingForDrivers'
import LiveTracking from '../components/LiveTracking'
import { SocketContext } from '../context/SocketContext'
import useAuthStore from '../stores/useAuthStore'

const Home = () => {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [pickupCoords, setPickupCoords] = useState(null)
  const [destinationCoords, setDestinationCoords] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [vehiclePanel, setVehiclePanel] = useState(false)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const [vehicleFound, setVehicleFound] = useState(false)
  const [waitingForDriver, setWaitingForDriver] = useState(false)
  const [pickupSuggestions, setPickupSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [activeField, setActiveField] = useState(null)
  const [fare, setFare] = useState({})
  const [vehicleType, setVehicleType] = useState(null)
  const [ride, setRide] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [counterOffers, setCounterOffers] = useState([])
  const [showOffers, setShowOffers] = useState(false)

  const debounceTimer = useRef(null)
  const navigate = useNavigate()
  const { socket } = useContext(SocketContext)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    socket.emit('join', { userType: 'user', userId: user._id })
    socket.on('ride-confirmed', (ride) => { setVehicleFound(false); setShowOffers(false); setCounterOffers([]); setWaitingForDriver(true); setRide(ride) })
    socket.on('ride-started', (ride) => { setWaitingForDriver(false); navigate('/riding', { state: { ride } }) })
    socket.on('counter-offer', (offer) => { setCounterOffers(prev => [...prev, offer]); setShowOffers(true) })
    return () => { socket.off('ride-confirmed'); socket.off('ride-started'); socket.off('counter-offer') }
  }, [socket, user, navigate])

  const fetchSuggestions = async (value, setter) => {
    if (value.length < 3) { setter([]); return }
    try {
      const response = await api.get('/api/maps/get-suggestions', {
        params: { input: value },
      })
      setter(response.data)
    } catch (err) { console.error(err) }
  }

  const handlePickupChange = (e) => {
    setPickup(e.target.value)
    setPickupCoords(null) // Clear coords when user types manually
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => fetchSuggestions(e.target.value, setPickupSuggestions), 500)
  }

  const handleDestinationChange = (e) => {
    setDestination(e.target.value)
    setDestinationCoords(null) // Clear coords when user types manually
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => fetchSuggestions(e.target.value, setDestinationSuggestions), 500)
  }

  const handleSuggestionSelect = (field, suggestion) => {
    if (suggestion && suggestion.coordinates) {
      if (field === 'pickup') setPickupCoords(suggestion.coordinates)
      else if (field === 'destination') setDestinationCoords(suggestion.coordinates)
    }
  }

  const findTrip = async () => {
    if (!pickup || !destination) return
    setVehiclePanel(true); setPanelOpen(false)
    try {
      const params = { pickup, destination }
      // Pass coordinates if available (avoids re-geocoding on server)
      if (pickupCoords) { params.pickupLtd = pickupCoords.ltd; params.pickupLng = pickupCoords.lng }
      if (destinationCoords) { params.destLtd = destinationCoords.ltd; params.destLng = destinationCoords.lng }
      const response = await api.get('/api/rides/get-fare', { params })
      setFare(response.data)
    } catch (err) { console.error(err) }
  }

  const createRide = async () => {
    try {
      const response = await api.post('/api/rides/create',
        { pickup, destination, vehicleType, pickupCoords, destinationCoords }
      )
      setRide(response.data)
    } catch (err) { console.error(err) }
  }

  const createNegotiableRide = async (suggestedFare) => {
    try {
      const response = await api.post('/api/rides/create-negotiable',
        { pickup, destination, vehicleType, suggestedFare, pickupCoords, destinationCoords }
      )
      setRide(response.data)
    } catch (err) { console.error(err) }
  }

  const acceptOffer = async (offer) => {
    try {
      await api.post('/api/rides/accept-offer', {
        rideId: ride._id, captainId: offer.captainId, amount: offer.amount
      })
      setShowOffers(false)
      setCounterOffers([])
    } catch (err) { console.error(err) }
  }

  const userCounterOffer = async (captainId, amount) => {
    try {
      await api.post('/api/rides/user-counter-offer', {
        rideId: ride._id, captainId, amount
      })
    } catch (err) { console.error(err) }
  }

  const cancelRide = async () => {
    if (!ride?._id) return
    try {
      await api.post('/api/rides/cancel', { rideId: ride._id })
      setVehicleFound(false); setWaitingForDriver(false); setRide(null); setVehiclePanel(false); setConfirmRidePanel(false)
    } catch (err) { alert(err.response?.data?.message || 'Cannot cancel ride') }
  }

  const hasOverlay = vehiclePanel || confirmRidePanel || vehicleFound || waitingForDriver

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">

      {/* ===== SIDEBAR ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] animate-overlay-in" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl animate-slide-right flex flex-col" onClick={e => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)', animationName: 'none', transform: 'translateX(0)' }}>
            {/* Sidebar Header */}
            <div className="bg-black p-6 pb-5">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
                <X size={22} />
              </button>
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <User size={28} className="text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg capitalize">{user?.fullname?.firstname} {user?.fullname?.lastname}</h3>
              <p className="text-white/50 text-sm">{user?.email}</p>
            </div>

            {/* Sidebar Links */}
            <nav className="flex-1 py-2">
              <Link to="/home" onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <MapPin size={20} className="text-gray-500" />
                <span className="font-medium text-gray-800">Book a Ride</span>
              </Link>
              <Link to="/user/history" onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <Clock size={20} className="text-gray-500" />
                <span className="font-medium text-gray-800">Ride History</span>
              </Link>
              <Link to="/user/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <User size={20} className="text-gray-500" />
                <span className="font-medium text-gray-800">My Profile</span>
              </Link>
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-gray-100 p-4">
              <Link to="/user/logout" className="flex items-center gap-3 px-2 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOP BAR ===== */}
      <div className="fixed top-0 left-0 right-0 z-30 px-4 pt-3 pb-2 sm:px-5 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="h-11 w-11 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
          <Menu size={20} className="text-gray-800" />
        </button>
        <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">RideNepal</h2>
        </div>
        <div className="w-11" />
      </div>

      {/* ===== MAP ===== */}
      <div className="absolute inset-0 z-0">
        <LiveTracking
          pickupCoords={pickupCoords}
          destinationCoords={destinationCoords}
          routePolyline={fare?.polyline}
        />
      </div>

      {/* ===== BOTTOM SHEET ===== */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        panelOpen ? 'h-[88vh]' : 'h-auto'
      }`}>
        <div className="bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] h-full flex flex-col overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Form */}
          <div className="px-5 pt-1 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[22px] font-bold text-gray-900">Where to?</h4>
              {panelOpen && (
                <button onClick={() => setPanelOpen(false)} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <ChevronDown size={18} className="text-gray-600" />
                </button>
              )}
            </div>

            <div className="relative">
              {/* Route line */}
              <div className="absolute left-[19px] top-[22px] bottom-[22px] w-[2px] bg-gradient-to-b from-emerald-400 to-red-400 rounded-full" />

              <div className="space-y-2.5">
                {/* Pickup */}
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 z-10">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 ring-[3px] ring-emerald-500/20" />
                  </div>
                  <input
                    onClick={() => { setPanelOpen(true); setActiveField('pickup') }}
                    value={pickup}
                    onChange={handlePickupChange}
                    className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3.5 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                    placeholder="Pick-up location"
                  />
                </div>

                {/* Destination */}
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 z-10">
                    <div className="h-3 w-3 rounded-sm bg-red-500 ring-[3px] ring-red-500/20" />
                  </div>
                  <input
                    onClick={() => { setPanelOpen(true); setActiveField('destination') }}
                    value={destination}
                    onChange={handleDestinationChange}
                    className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3.5 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                    placeholder="Where to?"
                  />
                </div>
              </div>
            </div>

            {/* Find Trip - shown when panel is closed */}
            {!panelOpen && (
              <button
                onClick={findTrip}
                disabled={!pickup || !destination}
                className="w-full mt-4 bg-gray-900 text-white py-3.5 rounded-2xl font-semibold text-[15px] active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:text-gray-500"
              >
                <Search size={18} className="inline mr-2 -mt-0.5" />
                Find Trip
              </button>
            )}
          </div>

          {/* Suggestions - scrollable */}
          {panelOpen && (
            <div className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide">
              <LocationSearchPanel
                suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                setPanelOpen={setPanelOpen}
                setVehiclePanel={setVehiclePanel}
                setPickup={setPickup}
                setDestination={setDestination}
                activeField={activeField}
                onSuggestionSelect={handleSuggestionSelect}
              />
              <button
                onClick={findTrip}
                disabled={!pickup || !destination}
                className="w-full mt-4 bg-gray-900 text-white py-3.5 rounded-2xl font-semibold text-[15px] active:scale-[0.98] transition-all sticky bottom-0 disabled:bg-gray-300 disabled:text-gray-500"
              >
                <Search size={18} className="inline mr-2 -mt-0.5" />
                Find Trip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== OVERLAY PANELS ===== */}

      {/* Vehicle Panel */}
      {vehiclePanel && (
        <Overlay onClose={() => setVehiclePanel(false)}>
          <VehiclePanel
            selectVehicle={setVehicleType}
            fare={fare}
            setConfirmRidePanel={setConfirmRidePanel}
            setVehiclePanel={setVehiclePanel}
          />
        </Overlay>
      )}

      {/* Confirm Ride */}
      {confirmRidePanel && (
        <Overlay onClose={() => setConfirmRidePanel(false)}>
          <ConfirmRide
            createRide={createRide}
            createNegotiableRide={createNegotiableRide}
            pickup={pickup}
            destination={destination}
            fare={fare}
            vehicleType={vehicleType}
            setConfirmRidePanel={setConfirmRidePanel}
            setVehicleFound={setVehicleFound}
          />
        </Overlay>
      )}

      {/* Looking For Driver + Counter Offers */}
      {vehicleFound && (
        <Overlay onClose={() => {}}>
          <LookingForDriver
            pickup={pickup} destination={destination} fare={fare}
            vehicleType={vehicleType} setVehicleFound={setVehicleFound}
            cancelRide={cancelRide} ride={ride}
          />
          {/* Counter Offers from captains */}
          {counterOffers.length > 0 && (
            <div className='px-5 pb-5'>
              <p className='text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3'>Captain Offers ({counterOffers.length})</p>
              <div className='space-y-3'>
                {counterOffers.map((offer, i) => (
                  <OfferCard key={i} offer={offer} onAccept={acceptOffer} onCounter={userCounterOffer} />
                ))}
              </div>
            </div>
          )}
        </Overlay>
      )}

      {/* Waiting For Driver */}
      {waitingForDriver && (
        <Overlay onClose={() => {}}>
          <WaitingForDriver
            ride={ride} setVehicleFound={setVehicleFound}
            setWaitingForDriver={setWaitingForDriver}
            waitingForDriver={waitingForDriver} cancelRide={cancelRide}
          />
        </Overlay>
      )}
    </div>
  )
}

// Reusable overlay wrapper - inDrive style bottom sheet
const Overlay = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 animate-overlay-in" onClick={onClose}>
    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
    <div className="absolute bottom-0 left-0 right-0 animate-slide-up" onClick={e => e.stopPropagation()}>
      <div className="bg-white rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white rounded-t-[28px] z-10">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        {children}
      </div>
    </div>
  </div>
)

// Offer card with accept + counter-offer
const OfferCard = ({ offer, onAccept, onCounter }) => {
  const [showCounter, setShowCounter] = useState(false)
  const [myPrice, setMyPrice] = useState(offer.amount)
  const [sent, setSent] = useState(false)

  const adjust = (val) => {
    const next = myPrice + val
    if (next >= 10 && next <= offer.amount * 3) setMyPrice(next)
  }

  const sendCounter = () => {
    onCounter(offer.captainId, myPrice)
    setSent(true)
    setTimeout(() => { setSent(false); setShowCounter(false) }, 1500)
  }

  return (
    <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
      <div className='flex items-center justify-between p-3'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center'>
            <span className='text-sm font-bold text-gray-600 uppercase'>{offer.captainName?.charAt(0)}</span>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-900'>{offer.captainName}</p>
            <div className='flex items-center gap-2 text-xs text-gray-500'>
              <span className='capitalize'>{offer.vehicleType}</span>
              <span>{offer.vehiclePlate}</span>
              {offer.captainRating > 0 && <span className='text-amber-600'>★ {offer.captainRating}</span>}
            </div>
          </div>
        </div>
        <span className='text-lg font-bold text-gray-900'>Rs. {offer.amount}</span>
      </div>

      {/* Action buttons */}
      <div className='flex border-t border-gray-100'>
        <button
          onClick={() => onAccept(offer)}
          className='flex-1 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors border-r border-gray-100'
        >
          Accept
        </button>
        <button
          onClick={() => { setShowCounter(!showCounter); setMyPrice(Math.round(offer.amount * 0.9)) }}
          className='flex-1 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors'
        >
          {showCounter ? 'Cancel' : 'Counter'}
        </button>
      </div>

      {/* Counter offer slider */}
      {showCounter && (
        <div className='bg-gray-900 p-4'>
          <div className='flex items-center justify-center gap-3'>
            <button onClick={() => adjust(-10)} className='h-9 w-9 bg-white/10 rounded-full flex items-center justify-center active:scale-90'>
              <Minus size={16} className="text-white" />
            </button>
            <span className='text-2xl font-bold text-white min-w-[100px] text-center'>Rs. {myPrice}</span>
            <button onClick={() => adjust(10)} className='h-9 w-9 bg-white/10 rounded-full flex items-center justify-center active:scale-90'>
              <Plus size={16} className="text-white" />
            </button>
          </div>
          <button
            onClick={sendCounter}
            disabled={sent}
            className='w-full mt-3 bg-amber-500 text-white py-2.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all disabled:bg-gray-600'
          >
            {sent ? 'Sent!' : `Send Rs. ${myPrice}`}
          </button>
        </div>
      )}
    </div>
  )
}

export default Home
