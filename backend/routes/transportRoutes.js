const express = require("express"); // Import Express framework
const axios = require("axios"); // Import axios to make HTTP requests
const TransportData = require("../models/TransportData"); // Import the Mongoose model for transport data
const router = express.Router(); // Create a new Express router instance

// Default route to test if transport route is active
router.get("/", (req, res) => {
  res.send("Transport API is running..."); // Respond with a simple message for testing
});

// Route to fetch real-time transport data from the National Transport API
router.get("/update-transport", async (req, res) => {
  try { // Handle asynchronous logic with try-catch
    const response = await axios.get("https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json", { // Make GET request to National Transport API with headers
      headers: {
        "x-api-key": process.env.TRANSPORT_API_KEY // Attach the transport API key stored in environment variables
      }
    });
    console.log("API response data:", response.data); // Log full API response for debugging

    const transportData = response.data.entity; // Extract the "entity" array from the API response

    const formattedData = transportData.map(item => { // Transform the raw data into a more usable format
      const tripUpdate = item.trip_update || {}; // Get the trip_update object
      const trip = tripUpdate.trip || {}; // Get the trip metadata (trip_id, route_id, etc.)
      const stopTimeUpdate = tripUpdate.stop_time_update || []; // Get the array of stop updates for the trip

      // Return formatted object with trip and stop details
      return {
        trip_id: trip.trip_id,
        start_time: trip.start_time,
        start_date: trip.start_date,
        schedule_relationship: trip.schedule_relationship,
        route_id: trip.route_id,
        direction_id: trip.direction_id,
        stops: stopTimeUpdate.map(stop => ({ // Map over each stop_time_update to extract stop-level details
          stop_sequence: stop.stop_sequence,
          stop_id: stop.stop_id,
          arrival_delay: stop.arrival?.delay,
          schedule_relationship: stop.schedule_relationship,
        })),
        vehicle_id: item.vehicle?.id, // Extract vehicle ID from the record (if available)
        timestamp: response.data.header.timestamp, // Add timestamp from response header to each record
      };
    }).filter(item => item.trip_id); // Filter out items without trip_id

    //console.log("Formatted data:", formattedData); // Debugging log

    await TransportData.deleteMany(); // Clear existing transport data from the database
    await TransportData.insertMany(formattedData); // Insert the new formatted data into the database

    res.json({ message: "Transport data updated successfully" }); // Respond with success if all went well
  } catch (error) {
    console.error("Error fetching transport data:", error); // Debugging log
    res.status(500).json({ message: "Error fetching transport data", error: error.message }); // Respond with error message if transport fetch fails
  }
});

// Route to get all transports with optional search filter
router.get("/transports", async (req, res) => {
  const searchQuery = req.query.search || ""; // Get search term from query parameters

  try {
    const data = await TransportData.find({ route_id: { $regex: searchQuery, $options: "i" } }); // Query transport data using case-insensitive regex on route_id
    res.json(data); // Return matching transport records as JSON
  } catch (error) {
    res.status(500).json({ message: "Error fetching transport data" }); // Catch any error and return failure message
  }
});

// Get transport data by route_id
router.get("/transports/route/:route_id", async (req, res) => {
  try {
    const data = await TransportData.find({ route_id: req.params.route_id }); // Query database for transport entries with given route_id
    res.json(data); // Respond with matching data
  } catch (error) {
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
