import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from 'react-router-dom'; // Import Link
import { FaBus, FaTrain, FaTram } from 'react-icons/fa'; // Import icons

// Helper function to get transport type name and icon
const getTransportTypeInfo = (type) => {
  switch (type) {
    case 0: return { name: 'Tram', Icon: FaTram, color: 'text-green-600' };
    case 1: return { name: 'Subway', Icon: FaTrain, color: 'text-blue-600' }; // Assuming Subway uses Train icon
    case 2: return { name: 'Rail', Icon: FaTrain, color: 'text-red-600' };
    case 3: return { name: 'Bus', Icon: FaBus, color: 'text-blue-500' };
    case 4: return { name: 'Ferry', Icon: null, color: 'text-cyan-600' }; // Add icons if available
    case 5: return { name: 'Cable Car', Icon: null, color: 'text-yellow-600' };
    case 6: return { name: 'Gondola', Icon: null, color: 'text-purple-600' };
    case 7: return { name: 'Funicular', Icon: null, color: 'text-orange-600' };
    default: return { name: 'Other', Icon: null, color: 'text-gray-500' };
  }
};

const Transport = () => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [routeId, setRouteId] = useState('');
  const [stopId, setStopId] = useState(''); // This will now hold the selected stop NAME
  const location = useLocation();
  const [type, setType] = useState(() => {
    const initialType = location.state?.initialTypeFilter || '';
    // Clear location state immediately if found
    if (location.state?.initialTypeFilter) {
        window.history.replaceState({}, document.title);
    }
    return initialType;
  });
  const [allStopNames, setAllStopNames] = useState([]); // State for all stop names
  const [filteredStopNames, setFilteredStopNames] = useState([]); // State for filtered suggestions

  // Fetch all stop names on component mount
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URI}api/transport/stops`)
      .then(res => {
        setAllStopNames(Array.isArray(res.data) ? res.data.sort() : []);
        setFilteredStopNames(Array.isArray(res.data) ? res.data.sort() : []); // Initially show all
      })
      .catch(err => {
        console.error("Error fetching stop names:", err);
        // Handle error appropriately, maybe show a message
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const fetchTransports = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (routeId) params.append('routeId', routeId);
    if (stopId) params.append('stopId', stopId); // Use stop name for search
    if (type) { // Only add type if it's not empty
        params.append('type', type);
    }
    const queryString = params.toString();
    const url = `${process.env.REACT_APP_API_URI}api/transport/transports${queryString ? '?' + queryString : ''}`;

    axios
      .get(url)
      .then((res) => {
        setTransports(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("fetchTransports: API Error:", err);
        setError("Failed to fetch transport data. Please try again.");
        setTransports([]);
        setLoading(false);
      });
  };

  // Effect to fetch transports when filters change
  useEffect(() => {
    fetchTransports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, routeId, stopId, type]); // Dependencies that trigger fetch

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransports();
  };

  // Handle input change for stop name and filter suggestions
  const handleStopInputChange = (e) => {
    const value = e.target.value;
    setStopId(value); // Update the state with the current input value
    // Filter suggestions based on input
    if (value) {
      setFilteredStopNames(
        allStopNames.filter(name => 
          name.toLowerCase().startsWith(value.toLowerCase())
        )
      );
    } else {
      setFilteredStopNames(allStopNames); // Show all if input is empty
    }
  };

  // --- Conditional Filtering and Grouping ---
  
  // Determine which data source to use for grouping
  let dataToGroup = transports; 
  
  // Apply the stricter filter ONLY if no specific stop is selected
  if (!stopId) {
    dataToGroup = transports.filter(transport => {
      const hasAtLeastOneKnownStop = transport.stops?.some(stop => stop.stop_name !== "Unknown Stop");
      return hasAtLeastOneKnownStop; // Only filter based on known stops now
    });
  } else {
    // When a specific stop is selected, we don't need the general filter
    // Ensure we are using the raw transports data fetched from the API
    dataToGroup = transports; 
  }

  // Group data by Stop Name (using dataToGroup)
  const stopsWithUpcomingVehicles = dataToGroup.reduce((acc, transport) => {
    transport.stops?.forEach(stop => {
      // Group by known stop names
      if (stop.stop_name && stop.stop_name !== "Unknown Stop") {
        const stopKey = stop.stop_name; 
        if (!acc[stopKey]) {
          acc[stopKey] = []; 
        }
        acc[stopKey].push({
          route_id: transport.route_id,
          route_type: transport.route_type, // Keep original route_type even if 0
          trip_id: transport.trip_id,
          direction_id: transport.direction_id,
          arrival_delay: stop.arrival_delay,
          stop_sequence: stop.stop_sequence, 
          stop_id: stop.stop_id,
          route_short_name: transport.route_short_name // Include route_short_name
        });
      }
    });
    return acc;
  }, {});

  // Sort arrivals within each stop (no changes)
  Object.keys(stopsWithUpcomingVehicles).forEach(stopKey => {
    stopsWithUpcomingVehicles[stopKey].sort((a, b) => {
      const delayA = a.arrival_delay ?? Infinity;
      const delayB = b.arrival_delay ?? Infinity;
      return delayA - delayB;
    });
  });
  // --- End Conditional Filtering and Grouping ---

  // Determine which stops to display
  let stopsToDisplay = stopsWithUpcomingVehicles;
  if (stopId) {
    // If a specific stop is selected, only prepare that one for display
    stopsToDisplay = stopsWithUpcomingVehicles[stopId] 
      ? { [stopId]: stopsWithUpcomingVehicles[stopId] } 
      : {};
  }

  const totalDisplayedStops = Object.keys(stopsToDisplay).length; // Count based on what's actually displayed

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800">Live Stop Departures</h2>

      {/* Search Form - Updated Stop Input */}
      <form onSubmit={handleSearch} className="mb-8 p-4 bg-gray-50 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* General Search */}
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">General Search</label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Route, Trip, Stop Name..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {/* Route ID */}
          <div>
            <label htmlFor="routeId" className="block text-sm font-medium text-gray-700">Route ID</label>
            <input
              type="text"
              id="routeId"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              placeholder="e.g., 1-1-A"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {/* Stop Name Input with Datalist */}
          <div>
            <label htmlFor="stopNameInput" className="block text-sm font-medium text-gray-700">Stop Name</label>
            <input
              type="text"
              id="stopNameInput"
              list="stopNameSuggestions"
              value={stopId} // Bind to stopId state (which holds the name)
              onChange={handleStopInputChange} // Use the new handler
              placeholder="e.g., Heuston Station"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              autoComplete="off" // Prevent browser's default autocomplete
            />
            <datalist id="stopNameSuggestions">
              {filteredStopNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
          </div>
          {/* Type Select */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => {
                  setType(e.target.value);
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="3">Bus</option>
              <option value="0">Tram</option>
              <option value="2">Rail</option>
              {/* Add other relevant types if needed */}
            </select>
          </div>
        </div>
      </form>

      {/* Debug Info (Adjusted) */}
      <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
        {stopId 
          ? `Displaying upcoming arrivals for "${stopId}".` 
          : `Displaying upcoming arrivals for ${totalDisplayedStops} stops.`}
        {/* Optionally add more debug info if needed */}
      </div>

      {/* Results Area - Grouped by Stop */}
      {loading && <div className="text-center py-10"><p className="text-lg text-gray-600">Loading...</p></div>}
      {error && <div className="text-center py-10"><p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p></div>}
      {!loading && !error && (
        <div className="space-y-8"> 
          {Object.keys(stopsToDisplay).length > 0 ? ( // Use stopsToDisplay
            Object.entries(stopsToDisplay).map(([stopName, arrivals]) => ( // Use stopsToDisplay
              <div key={stopName} className="bg-white rounded-lg shadow-md overflow-hidden">
                <h3 className="p-4 bg-gray-100 border-b border-gray-200 text-xl font-semibold text-gray-800">{stopName}</h3>
                <ul className="divide-y divide-gray-200">
                  {arrivals.map((arrival) => {
                    // Use arrival.route_type directly, even if it's 0
                    const { name: typeName, Icon: TypeIcon, color: typeColor } = getTransportTypeInfo(arrival.route_type);
                    const delayText = arrival.arrival_delay == null ? 'N/A' : (arrival.arrival_delay <= 0 ? 'On time' : `${Math.round(arrival.arrival_delay / 60)} min delay`);
                    const delayColorClass = arrival.arrival_delay == null ? 'bg-gray-100 text-gray-800' : (arrival.arrival_delay > 60 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800');

                    // Use route_short_name if available, otherwise fallback to route_id
                    const routeDisplayName = arrival.route_short_name || arrival.route_id;

                    return (
                      // Wrap the list item content in a Link
                      <li key={`${arrival.trip_id}-${arrival.stop_id}`}>
                        <Link 
                          to={`/transport/${arrival.route_id}`} 
                          className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 hover:bg-gray-50 transition duration-150 ease-in-out block" // Make link block and add hover effect
                        >
                          <div className="flex items-center space-x-3">
                            {TypeIcon && <TypeIcon className={`w-5 h-5 ${typeColor}`} />}
                            <div>
                              <span className={`font-medium ${typeColor}`}>{routeDisplayName}</span>
                              <span className="text-sm text-gray-600 ml-2">({typeName})</span>
                              <span className="text-sm text-gray-500 block sm:inline sm:ml-2">{arrival.direction_id === 0 ? 'Outbound' : 'Inbound'}</span>
                            </div>
                          </div>
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${delayColorClass}`}>
                            {delayText}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-lg text-gray-500">No upcoming arrivals found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transport;
