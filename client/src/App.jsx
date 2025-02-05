import React from 'react';
import Home from './pages/homePage/Home.jsx';
import Facilities from './pages/facilitiesPage/Facilities.jsx';
import Footer from './pages/layout/Footer.jsx';
import Header from './pages/layout/Header.jsx';
import Reservation from './pages/reservationPage/Reservation.jsx';
import Manage from './pages/managePage/manage.jsx';
import Register from './pages/registrationPage/Register.jsx';
import Login from './pages/loginPage/Login.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from './AuthGuard.jsx';
import { AuthProvider } from './AuthContext.jsx'; 

function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/facilities" element={<Layout><Facilities /></Layout>} />
          {/* Protected routes */}
          <Route path="/reservation" element={<AuthGuard><Layout><Reservation /></Layout></AuthGuard>} />
          <Route path="/manage" element={<AuthGuard roles={["admin"]}><Layout><Manage /></Layout></AuthGuard>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}