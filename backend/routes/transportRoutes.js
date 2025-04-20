const express = require("express"); // Import Express framework
const axios = require("axios"); // Import axios to make HTTP requests
const fs = require('fs'); // Import Node.js File System module
const path = require('path'); // Import Node.js Path module
const { createWriteStream } = require('fs'); // Import createWriteStream from fs
const { promisify } = require('util'); // Import promisify from util
const stream = require('stream'); // Import stream module
const pipeline = promisify(stream.pipeline); // Promisify pipeline for stream handling
const AdmZip = require('adm-zip'); // Import AdmZip for handling zip files
const TransportData = require("../models/TransportData"); // Import the Mongoose model for transport data
const router = express.Router(); // Create a new Express router instance

// --- GTFS Data Configuration ---
const GTFS_URL = 'https://www.transportforireland.ie/transitData/Data/GTFS_Realtime.zip';
const gtfsDir = path.join(__dirname, '..', 'api_definitions', 'GTFS_Realtime');
const gtfsZipPath = path.join(gtfsDir, 'GTFS_Realtime.zip');
const stopsFilePath = path.join(gtfsDir, 'stops.txt');
const routesFilePath = path.join(gtfsDir, 'routes.txt');

// Maps for storing GTFS data
const stopDataMap = new Map(); // Map<stop_id, stop_name>
const routeDataMap = new Map(); // Map<route_id, { type: number, shortName: string, longName: string }>

// Download and extract GTFS data if missing
async function ensureGTFSData() {
    try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(gtfsDir)) {
            fs.mkdirSync(gtfsDir, { recursive: true });
        }

        // Check if required files exist
        const filesExist = fs.existsSync(stopsFilePath) && fs.existsSync(routesFilePath);
        
        if (!filesExist) {
            console.log('GTFS files missing, downloading...');
            
            // Download the zip file
            const response = await axios({
                method: 'get',
                url: GTFS_URL,
                responseType: 'stream',
                timeout: 30000 // 30 second timeout
            });

            // Create temp directory if needed
            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Save to temp location first
            const tempZipPath = path.join(tempDir, 'gtfs_temp.zip');
            await pipeline(response.data, createWriteStream(tempZipPath));
            console.log('Download completed');

            // Extract the zip file
            console.log('Extracting files...');
            const zip = new AdmZip(tempZipPath);
            zip.extractAllTo(gtfsDir, true);
            console.log('Extraction completed');

            // Clean up temp files
            fs.unlinkSync(tempZipPath);
            if (fs.existsSync(tempDir)) {
                fs.rmdirSync(tempDir);
            }
            console.log('Cleanup completed');

            // Verify files were extracted correctly
            if (!fs.existsSync(stopsFilePath) || !fs.existsSync(routesFilePath)) {
                throw new Error('Required GTFS files not found after extraction');
            }
        }
    } catch (error) {
        console.error('Error downloading or extracting GTFS data:', error);
        throw error;
    }
}

// Function to parse CSV data simply (assumes no commas within fields)
const parseCsv = (data) => {
  const lines = data.trim().split('\n');
  // Handle potential empty lines or files
  if (lines.length < 1) return []; 
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const rowObject = {};
    headers.forEach((header, index) => {
      // Ensure value exists before trimming
      rowObject[header] = values[index] ? values[index].trim() : ''; 
    });
    return rowObject;
  });
  return rows;
};

// --- Function to load routes from a given file path into the map ---
const loadRoutesFromFile = (filePath, map) => {
  try {
    if (fs.existsSync(filePath)) { // Check if file exists
      const routesData = fs.readFileSync(filePath, 'utf8');
      const routes = parseCsv(routesData);
      routes.forEach(route => {
        if (route.route_id && route.route_type) {
          const routeType = parseInt(route.route_type, 10);
          if (!isNaN(routeType)) {
            // Store type, short_name, and long_name
            map.set(route.route_id, {
              type: routeType,
              shortName: route.route_short_name || '', // Use short name, fallback empty
              longName: route.route_long_name || '' // Use long name, fallback empty
            });
          }
        }
      });
      console.log(`Loaded ${map.size} routes from ${filePath}`);
    } else {
      console.warn(`Routes file not found at ${filePath}`);
    }
  } catch (err) {
    console.error(`Error loading or parsing routes file at ${filePath}:`, err);
  }
};
// --- End Route Loading Function ---

// Updated route loading function
async function loadGTFSData() {
    try {
        await ensureGTFSData();
        
        // Load stops
        if (fs.existsSync(stopsFilePath)) {
            const stopsData = fs.readFileSync(stopsFilePath, 'utf8');
            const stops = parseCsv(stopsData);
            stops.forEach(stop => {
                if (stop.stop_id && stop.stop_name) {
                    stopDataMap.set(stop.stop_id, stop.stop_name);
                }
            });
            console.log(`Loaded ${stopDataMap.size} stops from GTFS.`);
        }

        // Load routes
        await loadRoutesFromFile(routesFilePath, routeDataMap);
        console.log(`Total unique routes loaded into routeDataMap: ${routeDataMap.size}`);
    } catch (err) {
        console.error("Error loading GTFS data:", err);
    }
}

// Initialize GTFS data when the module loads
loadGTFSData();

const getStopNameById = (stopId) => stopDataMap.get(stopId) || "Unknown Stop";
// Updated function to get route details
const getRouteDetailsById = (routeId) => {
  const details = routeDataMap.get(routeId);
  if (!details) {
    // Log when a lookup fails and we return the default
    // Update warning message and default type to 3 (Bus)
    console.warn(`WARN: Route ID '${routeId}' not found in routeDataMap. Returning default (type 3 - Bus).`);
    return { type: 3, shortName: routeId, longName: '' }; // Default type is now 3 (Bus)
  }
  return details;
};

// --- Reusable function to fetch and store real-time data ---
async function fetchAndStoreRealtimeData() {
  console.log("Attempting to fetch and store real-time transport data...");
  try {
    const response = await axios.get("https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json", {
      headers: {
        "x-api-key": process.env.TRANSPORT_API_KEY
      }
    });

    const transportData = response.data.entity;
    const formattedData = transportData.map(item => {
      const tripUpdate = item.trip_update || {};
      const trip = tripUpdate.trip || {};
      const stopTimeUpdate = tripUpdate.stop_time_update || [];
      // Get route details using the updated function
      const routeDetails = getRouteDetailsById(trip.route_id);

      return {
        trip_id: trip.trip_id,
        start_time: trip.start_time,
        start_date: trip.start_date,
        schedule_relationship: trip.schedule_relationship,
        route_id: trip.route_id,
        route_type: routeDetails.type, // Get type from details
        route_short_name: routeDetails.shortName, // Add short name
        route_long_name: routeDetails.longName, // Add long name
        direction_id: trip.direction_id,
        stops: stopTimeUpdate.map(stop => ({
          stop_sequence: stop.stop_sequence,
          stop_id: stop.stop_id,
          stop_name: getStopNameById(stop.stop_id),
          arrival_delay: stop.arrival?.delay,
          schedule_relationship: stop.schedule_relationship,
        })),
        vehicle_id: item.vehicle?.id,
        timestamp: response.data.header.timestamp,
      };
    }).filter(item => item.trip_id);

    if (formattedData.length > 0) {
      await TransportData.deleteMany({});
      await TransportData.insertMany(formattedData);
      console.log(`Successfully fetched and stored ${formattedData.length} transport records.`);
      return formattedData; // Return the newly fetched data
    } else {
      console.log("No valid transport data received from API to update.");
      return []; // Return empty array if no data
    }
  } catch (error) {
    console.error("Error in fetchAndStoreRealtimeData:", error);
    // Rethrow the error to be caught by the calling route
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`Error fetching transport data: ${errorMessage}`);
  }
}

// Default route to test if transport route is active
router.get("/", (req, res) => {
  res.send("Transport API is running...");
});

// --- New Route to get Stop Names ---
router.get("/stops", (req, res) => {
  try {
    // Convert the Map values (stop names) to an array
    const stopNames = Array.from(stopDataMap.values());
    res.json(stopNames);
  } catch (error) {
    console.error("Error fetching stop names:", error);
    res.status(500).json({ message: "Error fetching stop names" });
  }
});
// --- End New Route ---

// Route to manually trigger an update
router.get("/update-transport", async (req, res) => {
  try {
    await fetchAndStoreRealtimeData();
    res.json({ message: "Transport data update process completed successfully." });
  } catch (error) {
    // Error is already logged in the helper function
    res.status(500).json({ message: "Error during transport data update.", error: error.message });
  }
});

// Route to get all transports with optional search filters
router.get("/transports", async (req, res) => {
  const { search, routeId, stopId, type } = req.query;
  const filterQuery = {};

  if (routeId) {
    filterQuery.route_id = { $regex: routeId, $options: "i" }; 
  }
  
  // --- Updated Stop Name Query --- 
  if (stopId) {
    // Directly query the stops array for an element matching the stop name (case-insensitive)
    filterQuery.stops = { 
      $elemMatch: { 
        stop_name: { $regex: `^${stopId}$`, $options: "i" } // Match exact name, case-insensitive
      }
    };
  }
  // --- End Updated Stop Name Query ---

  if (search) {
    filterQuery.$or = filterQuery.$or || [];
    filterQuery.$or.push({ route_id: { $regex: search, $options: "i" } });
    filterQuery.$or.push({ trip_id: { $regex: search, $options: "i" } });
    // Add stop name search back to general search if needed, but ensure it doesn't conflict with specific stopId filter
    if (!stopId) { // Only add stop name to general search if not specifically filtering by stop name
        filterQuery.$or.push({ 'stops.stop_name': { $regex: search, $options: "i" } }); 
    }
  }
  if (type) {
    const routeType = parseInt(type, 10);
    if (!isNaN(routeType)) {
      filterQuery.route_type = routeType; 
    }
  }

  try {
    // Check if the collection is empty
    const count = await TransportData.countDocuments();
    let data;

    if (count === 0) {
      console.log("Transport data collection is empty. Triggering update...");
      try {
        // Fetch fresh data and store it
        await fetchAndStoreRealtimeData(); 
        // Now query the newly populated data with filters
        data = await TransportData.find(filterQuery);
      } catch (updateError) {
        // If the update fails, return the error
        console.error("Failed to update transport data:", updateError);
        return res.status(500).json({ message: "Failed to fetch initial transport data", error: updateError.message });
      }
    } else {
      // If not empty, just find data matching the constructed filter query
      data = await TransportData.find(filterQuery);
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching transport data in /transports route:", error);
    res.status(500).json({ message: "Error fetching transport data" });
  }
});

// Get transport data by route_id
router.get("/transports/route/:route_id", async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /transports/route/${req.params.route_id} - Request received`); // Log request
  try {
    const data = await TransportData.find({ route_id: req.params.route_id }); // Query database for transport entries with given route_id
    console.log(`[${new Date().toISOString()}] GET /transports/route/${req.params.route_id} - Found ${data.length} records`); // Log success
    res.json(data); // Respond with matching data
  } catch (error) {
    console.error(`[${new Date().toISOString()}] GET /transports/route/${req.params.route_id} - Error:`, error); // Log error
    res.status(500).json({ message: "Error fetching transport data by route_id" }); // Handle database errors
  }
});

// Get transport data by trip_id
router.get("/transports/trip/:trip_id", async (req, res) => {
  try {
    const data = await TransportData.find({ trip_id: req.params.trip_id }); // Query database for transport entries with given trip_id
    res.json(data); // Respond with matching data
  } catch (error) {
    res.status(500).json({ message: "Error fetching transport data by trip_id" }); // Handle errors
  }
});

// Get individual transport details
router.get("/transport/:id", async (req, res) => {
  try {
    const transport = await TransportData.findById(req.params.id); // Look up transport entry by its MongoDB `_id`
    if (!transport) return res.status(404).json({ message: "Transport not found" }); // Return 404 if not found

    res.json(transport); // Return the found transport entry
  } catch (error) {
    res.status(500).json({ message: "Error fetching transport details" }); // Catch errors and return error response
  }
});
// Export the router to be used in the main server file
module.exports = router;
