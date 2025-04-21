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
//import EditProfileModal from "./components/EditProfileModal";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/transports" element={<Transport />} />
        <Route path="/transport/:routeId" element={<TransportDetail />} /> {/* Add dynamic route */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
