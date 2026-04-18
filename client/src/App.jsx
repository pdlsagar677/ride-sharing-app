import { Routes, Route } from "react-router-dom";
import React from "react";
import "./App.css";
import Start from "./pages/Start";
import UserSignup from "./pages/UserSignup";
import { ToastContainer } from "react-toastify";
import CaptainSignup from "./pages/CaptainSignup";
import UserLogin from "./pages/UserLogin";
import CaptainLogin from "./pages/CaptainLogin";
import CaptainHome from "./pages/CaptainHome";
import CaptainProtectWrapper from "./pages/CaptainProtectWrapper";
import Riding from "./pages/Riding"
import CaptainRiding from "./pages/CaptainRiding"
import Home from "./pages/Home"
import UserProtectWrapper from "./pages/UserProtectWrapper"
import UserLogout from "./pages/UserLogout"
import CaptainLogout from "./pages/CaptainLogout"
import UserProfile from "./pages/UserProfile"
import CaptainProfile from "./pages/CaptainProfile"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentFailed from "./pages/PaymentFailed"
import UserRideHistory from "./pages/UserRideHistory"
import CaptainRideHistory from "./pages/CaptainRideHistory"
import EditProfile from "./pages/EditProfile"
import ChangePassword from "./pages/ChangePassword"
import ForgotPassword from "./pages/ForgotPassword"
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path='/riding' element={<Riding />} />
        <Route path='/edit-profile' element={<EditProfile />} />
        <Route path='/change-password' element={<ChangePassword />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/payment-success' element={<PaymentSuccess />} />
        <Route path='/payment-failed' element={<PaymentFailed />} />
        <Route path='/captain-riding' element={<CaptainRiding />} />

        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route path="captain-login" element={<CaptainLogin />} />
         <Route path='/home'
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          } />
          <Route path='/user/profile'
          element={
            <UserProtectWrapper>
              <UserProfile />
            </UserProtectWrapper>
          } />
          <Route path='/user/history'
          element={
            <UserProtectWrapper>
              <UserRideHistory />
            </UserProtectWrapper>
          } />
          <Route path='/user/logout'
          element={<UserProtectWrapper>
            <UserLogout />
          </UserProtectWrapper>
          } />
        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrapper>
              <CaptainHome />
            </CaptainProtectWrapper>
          }
        />
         <Route path='/captain/profile' element={
          <CaptainProtectWrapper>
            <CaptainProfile />
          </CaptainProtectWrapper>
        } />
         <Route path='/captain/history' element={
          <CaptainProtectWrapper>
            <CaptainRideHistory />
          </CaptainProtectWrapper>
        } />
         <Route path='/captain/logout' element={
          <CaptainProtectWrapper>
            <CaptainLogout />
          </CaptainProtectWrapper>
        } />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
