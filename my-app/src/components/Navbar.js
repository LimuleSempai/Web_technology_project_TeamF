import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4 text-white flex justify-between">
      <Link to="/" className="font-bold">Transport App</Link>
      <div>
        <Link to="/transports" className="mr-4">Transports</Link>
        <Link to="/login" className="mr-4">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/about">About Us</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;
