import React from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Home = () => {
  const navigate = useNavigate(); // Initialize navigate function

  // Function to handle navigation to Transport page with type filter
  const handleTypeClick = (type) => {
    navigate('/transports', { state: { initialTypeFilter: type.toString() } });
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Transport Finder</h1>
      <p className="mb-6">Search and review transport options in your city.</p>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleTypeClick(3)} // GTFS type for Bus
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Search Buses
        </button>
        <button
          onClick={() => handleTypeClick(0)} // GTFS type for Tram
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Search Trams (Luas)
        </button>
        <button
          onClick={() => handleTypeClick(2)} // GTFS type for Rail
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Search Rail (DART)
        </button>
        {/* Add more buttons for other types if needed */}
      </div>
    </div>
  );
};

export default Home;
