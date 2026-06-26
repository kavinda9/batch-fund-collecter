import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/home/HomePage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes will be added here */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  )
}

export default App
