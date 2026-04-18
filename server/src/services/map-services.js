const axios = require('axios');
const captainModel = require('../models/captain-model');

// Free APIs used:
// - Nominatim for geocoding (address -> coordinates)
// - Photon (komoot) for autocomplete (better place search than Nominatim)
// - OSRM for routing (distance, duration, route polyline)

module.exports.getAddressCoordinate = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=np&limit=1`;

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'RideNepal/1.0' }
        });

        if (response.data && response.data.length > 0) {
            return {
                ltd: parseFloat(response.data[0].lat),
                lng: parseFloat(response.data[0].lon)
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Route using OSRM with coordinates directly (no geocoding needed)
async function getOsrmRoute(originCoords, destCoords) {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.ltd};${destCoords.lng},${destCoords.ltd}?overview=full&geometries=polyline`;

    const response = await axios.get(url, {
        headers: { 'User-Agent': 'RideNepal/1.0' }
    });

    if (response.data.code === 'Ok' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
            distance: {
                text: `${(route.distance / 1000).toFixed(1)} km`,
                value: route.distance // meters
            },
            duration: {
                text: `${Math.round(route.duration / 60)} mins`,
                value: route.duration // seconds
            },
            polyline: route.geometry // encoded polyline string
        };
    } else {
        throw new Error('No routes found');
    }
}

// Get distance, time, and route polyline from address strings
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        const originCoords = await module.exports.getAddressCoordinate(origin);
        const destCoords = await module.exports.getAddressCoordinate(destination);
        return await getOsrmRoute(originCoords, destCoords);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Get distance, time, and route polyline from coordinate objects directly
module.exports.getDistanceTimeFromCoords = async (originCoords, destCoords) => {
    if (!originCoords || !destCoords) {
        throw new Error('Origin and destination coordinates are required');
    }

    try {
        return await getOsrmRoute(originCoords, destCoords);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Autocomplete using Photon (komoot) - better place search than Nominatim
module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    // Photon API with location bias toward Kathmandu, Nepal
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(input)}&limit=5&lat=27.7172&lon=85.3240&lang=en`;

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'RideNepal/1.0' }
        });

        if (response.data && response.data.features && response.data.features.length > 0) {
            return response.data.features.map(feature => ({
                description: formatPlaceName(feature.properties),
                coordinates: {
                    ltd: feature.geometry.coordinates[1], // lat
                    lng: feature.geometry.coordinates[0]  // lon
                }
            }));
        } else {
            return [];
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

function formatPlaceName(props) {
    const parts = [];
    if (props.name) parts.push(props.name);
    if (props.street && props.street !== props.name) parts.push(props.street);
    if (props.city && props.city !== props.name) parts.push(props.city);
    else if (props.county) parts.push(props.county);
    if (props.state && parts.length < 3) parts.push(props.state);
    return parts.join(', ') || props.name || 'Unknown location';
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius, vehicleType) => {
    // radius in km
    // Find all captains who have a location, active socketId, and matching vehicle type
    const query = {
        'location.ltd': { $exists: true, $ne: null },
        'location.lng': { $exists: true, $ne: null },
        socketId: { $exists: true, $ne: null }
    };

    if (vehicleType) {
        query['vehicle.vehicleType'] = vehicleType;
    }

    const captains = await captainModel.find(query);

    // Filter by distance using Haversine formula
    const nearbyCaptains = captains.filter(captain => {
        const dist = getDistanceFromLatLng(
            ltd, lng,
            captain.location.ltd, captain.location.lng
        );
        return dist <= radius;
    });

    return nearbyCaptains;
}

// Haversine formula - returns distance in km between two lat/lng points
function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}
