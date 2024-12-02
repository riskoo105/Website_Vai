import React from 'react'
import Home from './pages/homePage/Home.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

export default function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
      
    </BrowserRouter>
  )
}

