import React, { useState, useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import LiveTracking from '../components/LiveTracking'
import { SocketContext } from '../context/SocketContext'

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false)
  const [paymentReceived, setPaymentReceived] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const location = useLocation()
  const rideData = location.state?.ride
  const { socket } = useContext(SocketContext)

  useEffect(() => {
    socket.on('payment-received', (data) => {
      setPaymentReceived(true)
      setPaymentAmount(data.amount)
    })

    return () => socket.off('payment-received')
  }, [socket])

  return (
    <div className='h-screen relative flex flex-col justify-end'>

      {/* Header */}
      <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-20'>
        <h2 className='text-xl font-bold text-black bg-white/80 px-3 py-1 rounded-lg'>RideNepal</h2>
        <Link to='/captain-home' className='h-10 w-10 bg-white shadow-md flex items-center justify-center rounded-full'>
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>

      {/* Payment Received Popup */}
      {paymentReceived && (
        <div className='fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full text-center'>
            <div className='h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className="ri-check-double-line text-3xl text-green-600"></i>
            </div>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>Payment Received!</h2>
            <p className='text-gray-500 mb-1'>Customer paid via eSewa</p>
            <p className='text-2xl font-bold text-green-600 mb-6'>Rs. {paymentAmount}</p>
            <button
              onClick={() => {
                setPaymentReceived(false)
                setFinishRidePanel(true)
              }}
              className='w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors'
            >
              Finish Ride
            </button>
          </div>
        </div>
      )}

      {/* Ride Info & Complete Button */}
      <div
        className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10 cursor-pointer'
        onClick={() => setFinishRidePanel(true)}
      >
        <h5 className='p-1 text-center w-[90%] absolute top-0'>
          <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
        </h5>
        <h4 className='text-xl font-semibold'>Ride in progress</h4>
        <button className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'>Complete Ride</button>
      </div>

      {/* Finish Ride Panel */}
      <div
        className={`fixed w-full z-[500] bottom-0 bg-white px-3 py-10 pt-12 transition-transform duration-300 ${
          finishRidePanel ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <FinishRide
          ride={rideData}
          setFinishRidePanel={setFinishRidePanel}
        />
      </div>

      {/* Live Tracking Background */}
      <div className='h-screen fixed w-screen top-0 z-[-1]'>
        <LiveTracking
          pickupCoords={rideData?.pickupCoords}
          destinationCoords={rideData?.destinationCoords}
          routePolyline={rideData?.routePolyline}
        />
      </div>
    </div>
  )
}

export default CaptainRiding
