import React from 'react'
import Home from './pages/homePage/Home.jsx'
import Facilities from './pages/facilitiesPage/Facilities.jsx'
import Footer from './pages/layout/Footer.jsx'
import Header from './pages/layout/Header.jsx'
import Reservation from './pages/reservationPage/Reservation.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

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
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/facilities.html" element={<Layout><Facilities /></Layout>} />
        <Route path="/reservation.html" element={<Layout><Reservation /></Layout>} />
      </Routes>
      
    </BrowserRouter>
  )
}

