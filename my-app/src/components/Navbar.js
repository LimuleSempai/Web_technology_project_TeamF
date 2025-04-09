import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4 text-white flex justify-between">
      <Link to="/" className="font-bold">Transport App</Link>
      <div>
        <Link to="/transports" className="mr-4">Transports</Link>
      </div>
    </nav>
  );
};

export default Navbar;
