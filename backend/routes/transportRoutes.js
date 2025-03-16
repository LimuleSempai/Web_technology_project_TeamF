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
    const response = await axios.get("API_ENDPOINT_HERE"); // Replace with the correct API
    const transportData = response.data.entity;

    await TransportData.deleteMany();
    await TransportData.insertMany(transportData);

    res.json({ message: "Transport data updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transport data" });
  }
});

// Get all transport data with search
router.get("/transports", async (req, res) => {
  const searchQuery = req.query.search || "";

  try {
    const data = await TransportData.find({ "trip_update.trip.route_id": { $regex: searchQuery, $options: "i" } });
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
