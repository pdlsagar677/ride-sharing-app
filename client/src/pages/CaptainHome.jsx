import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, Clock, LogOut, MapPin } from "lucide-react";
import CaptainDetails from "../components/CaptainDetails";
import RidePopUp from "../components/RidePopUp";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import LiveTracking from "../components/LiveTracking";
import { SocketContext } from "../context/SocketContext";
import useAuthStore from "../stores/useAuthStore";
import api from "../lib/axios";

const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
  const [ride, setRide] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { socket } = useContext(SocketContext);
  const { captain } = useAuthStore();

  useEffect(() => {
    if (!captain) return;

    socket.emit("join", { userId: captain._id, userType: "captain" });

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            socket.emit("update-location-captain", {
              userId: captain._id,
              location: { ltd: position.coords.latitude, lng: position.coords.longitude },
            });
          },
          (err) => {
            console.warn('Captain geolocation error:', err.message);
          },
          geoOptions
        );
      }
    };

    const locationInterval = setInterval(updateLocation, 10000);
    updateLocation();
    return () => clearInterval(locationInterval);
  }, [socket, captain]);

  useEffect(() => {
    socket.on("new-ride", (data) => { setRide(data); setRidePopupPanel(true); });
    socket.on("ride-cancelled", () => { setRide(null); setRidePopupPanel(false); setConfirmRidePopupPanel(false); });
    socket.on("offer-accepted", (data) => { setRide(data); setRidePopupPanel(false); setConfirmRidePopupPanel(true); });
    socket.on("user-counter-offer", (data) => {
      // User countered our offer - show ride again with their new price
      setRide({ ...data.ride, suggestedFare: data.amount, isNegotiable: true });
      setRidePopupPanel(true);
    });
    return () => { socket.off("new-ride"); socket.off("ride-cancelled"); socket.off("offer-accepted"); socket.off("user-counter-offer"); };
  }, [socket]);

  async function confirmRide() {
    try {
      await api.post('/api/rides/confirm', {
        rideId: ride._id, captainId: captain._id
      });
      setRidePopupPanel(false);
      setConfirmRidePopupPanel(true);
    } catch (error) {
      console.error("Failed to confirm ride:", error);
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">

      {/* ===== SIDEBAR ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] animate-overlay-in" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-black p-6 pb-5">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
                <X size={22} />
              </button>
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-white uppercase">{captain?.fullname?.firstname?.charAt(0)}</span>
              </div>
              <h3 className="text-white font-semibold text-lg capitalize">{captain?.fullname?.firstname} {captain?.fullname?.lastname}</h3>
              <p className="text-white/50 text-sm">{captain?.email}</p>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${captain?.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                {captain?.status === 'active' ? 'Online' : 'Offline'}
              </span>
            </div>

            <nav className="flex-1 py-2">
              <Link to="/captain-home" onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <MapPin size={20} className="text-gray-500" />
                <span className="font-medium text-gray-800">Dashboard</span>
              </Link>
              <Link to="/captain/history" onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <Clock size={20} className="text-gray-500" />
                <span className="font-medium text-gray-800">Ride History</span>
              </Link>
              <Link to="/captain/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <User size={20} className="text-gray-500" />
                <span className="font-medium text-gray-800">My Profile</span>
              </Link>
            </nav>

            <div className="border-t border-gray-100 p-4">
              <Link to="/captain/logout" className="flex items-center gap-3 px-2 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
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
        <LiveTracking />
      </div>

      {/* ===== CAPTAIN DETAILS BOTTOM ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-5">
          <div className="flex justify-center -mt-3 mb-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <CaptainDetails />
        </div>
      </div>

      {/* ===== RIDE POPUP ===== */}
      {ridePopupPanel && (
        <div className="fixed inset-0 z-50 animate-overlay-in" onClick={() => setRidePopupPanel(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="absolute bottom-0 left-0 right-0 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white rounded-t-[28px] z-10">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <RidePopUp
                ride={ride}
                setRidePopupPanel={setRidePopupPanel}
                setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                confirmRide={confirmRide}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRM RIDE POPUP ===== */}
      {confirmRidePopupPanel && (
        <div className="fixed inset-0 z-50 animate-overlay-in">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="absolute bottom-0 left-0 right-0 animate-slide-up">
            <div className="bg-white rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white rounded-t-[28px] z-10">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <ConfirmRidePopUp
                ride={ride}
                setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                setRidePopupPanel={setRidePopupPanel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptainHome;
