# 🚗 RideNepal – Full Stack Ride Sharing Application

RideNepal is a Nepal-focused ride-sharing platform inspired by apps like Uber, Pathao, and inDrive. It provides real-time ride booking, fare negotiation, live tracking, and local payment integrations using a modern full-stack architecture.

---

# 📌 Overview

RideNepal is built using the **MERN stack (MongoDB, Express, React, Node.js)** with real-time communication via **Socket.io**. It is optimized for Nepal with local currency (Rs.), geolocation defaults, and integrations like eSewa and Khalti.

---

# ✨ Key Features

### 🚀 Core Features

* Real-time ride booking & matching
* Live driver tracking (Socket.io)
* Ride history (user & captain)
* OTP-based ride start verification
* 1-minute cancellation window
* Fare calculation (distance + time)

### 🔐 Authentication & Security

* JWT-based authentication (httpOnly cookies)
* OTP verification (email-based)
* Password reset & change
* Token blacklisting on logout
* Helmet + rate limiting ready
* NoSQL injection protection

### 💳 Payments (Nepal Specific)

* eSewa (sandbox integration)
* Khalti (sandbox integration)
* Payment verification & captain notification

### 🗺️ Maps & Location (Free APIs)

* OpenStreetMap + Leaflet
* Nominatim (autocomplete, Nepal-only)
* OSRM (routing & ETA)
* No paid API keys required

### ⭐ Advanced Features

* Fare negotiation (inDrive-style)
* Rating & review system
* Profile management (user & captain)
* Zustand state management
* Real-time socket events
* Responsive Tailwind UI

---

# 🏗️ System Architecture

### High-Level Flow

Client (React) → Axios/Socket → Express Server → MongoDB
                      ↘ External APIs (Maps, Payments)

### Layers

* **Frontend:** React + Vite + Tailwind
* **Backend:** Express + Mongoose
* **Realtime:** Socket.io
* **Database:** MongoDB Atlas

---

# 🧠 Tech Stack

## Frontend

* React 19
* Vite
* Tailwind CSS
* Socket.io-client
* Axios
* Zustand
* Lucide Icons

## Backend

* Express 5
* MongoDB + Mongoose
* JWT (jsonwebtoken)
* bcrypt
* Socket.io
* express-validator

---

# 📊 Data Models

### User

* Name, Email, Password (hashed)
* Socket ID
* Auth Token

### Captain

* Vehicle info (type, plate, capacity)
* Status (active/inactive)
* Location (lat/lng)

### Ride

* Pickup & destination
* Fare, distance, duration
* Status (pending → completed)
* OTP verification
* Payment info

---

# 🔄 Ride Flow

1. User creates ride
2. Server finds nearby captains
3. Captains receive real-time request
4. Captain accepts → user notified
5. OTP verification → ride starts
6. Ride ends → fare finalized

---

# 🔌 API Overview

### Auth

* `/api/users/register`
* `/api/users/login`
* `/api/users/profile`
* `/api/users/logout`

### Rides

* `/api/rides/create`
* `/api/rides/confirm`
* `/api/rides/start-ride`
* `/api/rides/end-ride`
* `/api/rides/cancel`

### Maps

* `/api/maps/get-coordinates`
* `/api/maps/get-distance-time`
* `/api/maps/get-suggestions`

### Payments

* `/api/payment/esewa/initiate`
* `/api/payment/khalti/initiate`

---

# ⚡ Real-Time Events (Socket.io)

* `new-ride`
* `ride-confirmed`
* `ride-started`
* `ride-ended`
* `ride-cancelled`
* `update-location-captain`

---

# 💰 Fare Calculation

```
fare = base + (distance × rate/km) + (time × rate/min)
```

| Vehicle    | Base | Per KM | Per Min |
| ---------- | ---- | ------ | ------- |
| Motorcycle | 20   | 8      | 1.5     |
| Car        | 50   | 15     | 3       |
| Auto       | 30   | 10     | 2       |

---

# ⚙️ Setup Instructions

## 1. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 2. Environment Variables

### Server (.env)

```
JWT_SECRET=your_secret
DB_CONNECT=your_mongodb_url
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Client (.env)

```
VITE_API_BASE_URL=http://localhost:3000
```

## 3. Run Project

```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

---

# 🌍 Deployment (Planned)

* Backend → Railway / Render / AWS
* Frontend → Vercel / Netlify
* Database → MongoDB Atlas

---

# ⚠️ Known Limitations

* No geospatial index (performance)
* Limited error handling middleware
* No offline support yet
* No push notifications
* Hardcoded configs in some places

---

# 🚀 Future Improvements

* Nepali language (i18n)
* SOS safety system
* Ride scheduling
* In-app chat
* Surge pricing
* Admin dashboard
* Push notifications (FCM)
* Redis caching

---

# 💡 Highlights

* 100% free mapping (no Google billing)
* Nepal-focused design & payments
* Real-time architecture
* Secure authentication (httpOnly cookies)
* Clean scalable backend structure

---

# 📌 Conclusion

RideNepal is a **production-ready, scalable ride-sharing platform** designed specifically for Nepal. It combines real-time systems, secure authentication, and local integrations to deliver a complete ride-booking experience.

---
