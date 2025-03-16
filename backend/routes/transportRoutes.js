const express = require("express");
const axios = require("axios");
const TransportData = require("../models/TransportData");
const router = express.Router();

// Default route for testing
router.get("/", (req, res) => {
  res.send("Transport API is running...");
});

// Fetch and store transport data from API
router.get("/update-transport", async (req, res) => {
  try {
    const response = await axios.get("https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json", {
      headers: {
        "x-api-key": process.env.TRANSPORT_API_KEY // Include the subscription key
      }
    });
    console.log("API response data:", response.data); // Debugging log

    const transportData = response.data.entity;

    const formattedData = transportData.map(item => {
      const tripUpdate = item.trip_update || {};
      const trip = tripUpdate.trip || {};
      const stopTimeUpdate = tripUpdate.stop_time_update || [];

      return {
        trip_id: trip.trip_id,
        start_time: trip.start_time,
        start_date: trip.start_date,
        schedule_relationship: trip.schedule_relationship,
        route_id: trip.route_id,
        direction_id: trip.direction_id,
        stops: stopTimeUpdate.map(stop => ({
          stop_sequence: stop.stop_sequence,
          stop_id: stop.stop_id,
          arrival_delay: stop.arrival?.delay,
          schedule_relationship: stop.schedule_relationship,
        })),
        vehicle_id: item.vehicle?.id,
        timestamp: response.data.header.timestamp,
      };
    }).filter(item => item.trip_id); // Filter out items without trip_id

    //console.log("Formatted data:", formattedData); // Debugging log

    await TransportData.deleteMany();
    await TransportData.insertMany(formattedData);

    res.json({ message: "Transport data updated successfully" });
  } catch (error) {
    console.error("Error fetching transport data:", error); // Debugging log
    res.status(500).json({ message: "Error fetching transport data", error: error.message });
  }
});

// Get all transport data with search
router.get("/transports", async (req, res) => {
  const searchQuery = req.query.search || "";

  try {
    const data = await TransportData.find({ route_id: { $regex: searchQuery, $options: "i" } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transport data" });
  }
});

// Get individual transport details
router.get("/transport/:id", async (req, res) => {
  try {
    const transport = await TransportData.findById(req.params.id);
    if (!transport) return res.status(404).json({ message: "Transport not found" });

    res.json(transport);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transport details" });
  }
});

module.exports = router;
