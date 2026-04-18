const socketIo = require('socket.io');
const userModel = require('../src/models/user-model');
const captainModel = require('../src/models/captain-model');
const rideModel = require('../src/models/ride-model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: [ 'GET', 'POST' ]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('join', async (data) => {
            const { userId, userType } = data;
            console.log(`Join event: ${userType} ${userId} -> socket ${socket.id}`);

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    status: 'active'
                });
            }
        });

        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;

            if (!location || location.ltd == null || location.lng == null) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    ltd: location.ltd,
                    lng: location.lng
                }
            });

            // Forward captain location to rider if there's an active ride
            try {
                const activeRide = await rideModel.findOne({
                    captain: userId,
                    status: { $in: ['accepted', 'ongoing'] }
                }).populate('user');

                if (activeRide && activeRide.user && activeRide.user.socketId) {
                    io.to(activeRide.user.socketId).emit('captain-location-update', {
                        ltd: location.ltd,
                        lng: location.lng
                    });
                }
            } catch (err) {
                console.error('Error forwarding captain location:', err.message);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {
    if (io) {
        console.log(`Sending ${messageObject.event} to socket ${socketId}`);
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
