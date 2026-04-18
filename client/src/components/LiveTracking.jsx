import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import polyline from '@mapbox/polyline'
import { Navigation } from 'lucide-react'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix default marker icon issue with Leaflet + bundlers (use local assets, not CDN)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

const defaultCenter = { lat: 27.7172, lng: 85.3240 }

const geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
}

// Custom marker icons
const pickupIcon = new L.DivIcon({
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
})

const destinationIcon = new L.DivIcon({
    html: '<div style="width:14px;height:14px;border-radius:3px;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
})

const captainIcon = new L.DivIcon({
    html: '<div style="width:32px;height:32px;border-radius:50%;background:#111;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L4 7v6c0 5 3.5 9.74 8 11 4.5-1.26 8-6 8-11V7l-8-5z"/></svg></div>',
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
})

// Fit bounds once when route first appears
const FitBoundsOnce = ({ bounds }) => {
    const map = useMap()
    const hasFitted = useRef(false)

    useEffect(() => {
        if (bounds && bounds.isValid() && !hasFitted.current) {
            map.fitBounds(bounds, { padding: [50, 50] })
            hasFitted.current = true
        }
    }, [bounds, map])

    // Reset when route changes
    useEffect(() => {
        hasFitted.current = false
    }, [bounds])

    return null
}

// Center on user location once on initial load (not continuously)
const InitialCenter = ({ position }) => {
    const map = useMap()
    const hasCentered = useRef(false)

    useEffect(() => {
        if (!hasCentered.current && position.lat !== defaultCenter.lat) {
            map.setView([position.lat, position.lng], 16)
            hasCentered.current = true
        }
    }, [position, map])

    return null
}

const LiveTracking = ({ pickupCoords, destinationCoords, routePolyline, captainLocation }) => {
    const [currentPosition, setCurrentPosition] = useState(defaultCenter)
    const [hasLocation, setHasLocation] = useState(false)
    const mapRef = useRef(null)

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setCurrentPosition({ lat: latitude, lng: longitude })
                setHasLocation(true)
            },
            (err) => console.warn('Geolocation error:', err.message),
            geoOptions
        )

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setCurrentPosition({ lat: latitude, lng: longitude })
                setHasLocation(true)
            },
            (err) => console.warn('Watch position error:', err.message),
            geoOptions
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    // "My Location" button handler
    const goToMyLocation = useCallback(() => {
        if (mapRef.current && hasLocation) {
            mapRef.current.setView([currentPosition.lat, currentPosition.lng], 16, { animate: true })
        }
    }, [currentPosition, hasLocation])

    // Decode the OSRM encoded polyline
    const decodedRoute = useMemo(() => {
        if (!routePolyline) return null
        try {
            return polyline.decode(routePolyline)
        } catch {
            return null
        }
    }, [routePolyline])

    // Calculate bounds for the route
    const routeBounds = useMemo(() => {
        if (!decodedRoute) return null
        return L.latLngBounds(decodedRoute.map(([lat, lng]) => [lat, lng]))
    }, [decodedRoute])

    const hasRoute = decodedRoute && pickupCoords && destinationCoords

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <MapContainer
                center={[currentPosition.lat, currentPosition.lng]}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User's current location - Google Maps style blue dot */}
                {hasLocation && (
                    <>
                        {/* Outer pulse ring */}
                        <CircleMarker
                            center={[currentPosition.lat, currentPosition.lng]}
                            radius={20}
                            pathOptions={{
                                color: '#4285F4',
                                fillColor: '#4285F4',
                                fillOpacity: 0.15,
                                weight: 0,
                            }}
                        />
                        {/* Inner solid dot */}
                        <CircleMarker
                            center={[currentPosition.lat, currentPosition.lng]}
                            radius={7}
                            pathOptions={{
                                color: '#ffffff',
                                fillColor: '#4285F4',
                                fillOpacity: 1,
                                weight: 3,
                            }}
                        />
                    </>
                )}

                {/* Route polyline */}
                {decodedRoute && (
                    <Polyline
                        positions={decodedRoute}
                        pathOptions={{ color: '#111827', weight: 5, opacity: 0.8 }}
                    />
                )}

                {/* Pickup marker */}
                {pickupCoords && (
                    <Marker
                        position={[pickupCoords.ltd, pickupCoords.lng]}
                        icon={pickupIcon}
                    />
                )}

                {/* Destination marker */}
                {destinationCoords && (
                    <Marker
                        position={[destinationCoords.ltd, destinationCoords.lng]}
                        icon={destinationIcon}
                    />
                )}

                {/* Captain location marker */}
                {captainLocation && (
                    <Marker
                        position={[captainLocation.ltd, captainLocation.lng]}
                        icon={captainIcon}
                    />
                )}

                {/* Fit route bounds once, or center on user once */}
                {hasRoute ? (
                    <FitBoundsOnce bounds={routeBounds} />
                ) : (
                    <InitialCenter position={currentPosition} />
                )}
            </MapContainer>

            {/* My Location button - Google Maps style */}
            <button
                onClick={goToMyLocation}
                className="absolute bottom-6 right-4 z-[1000] h-11 w-11 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:bg-gray-50"
                title="My Location"
            >
                <Navigation size={20} className={hasLocation ? 'text-blue-500' : 'text-gray-400'} />
            </button>
        </div>
    )
}

export default LiveTracking
