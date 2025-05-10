// Created by LimuleSempai : 25/03/25
// Modified 8 times by LimuleSempai : last 10/05/25
// Modified 1 time by Warnex04 : last 20/04/25

// Organize components in the web app

import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Transport from "./pages/Transport";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from './components/Header';
import Footer from './components/Footer';
import AboutUs from './pages/AboutUs';
import Profile from './pages/Profile';
import TransportDetail from './pages/TransportDetail'; // Import the new component

function App() {
  return (
    <Router>
      <div className="app-wrapper">
      <Header />
      <main className="app-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/transports" element={<Transport />} />
        <Route path="/transport/:routeId" element={<TransportDetail />} /> {/* Add dynamic route */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      </main>
      <Footer />
      </div>
    </Router>
  );
}

export default App;
