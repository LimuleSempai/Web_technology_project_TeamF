const mongoose = require("mongoose"); // Import the Mongoose ODM library
// Define a new schema for storing transport data
const TransportDataSchema = new mongoose.Schema({
  trip_id: { type: String, required: true }, // Trip ID: required identifier for a transport trip
  start_time: { type: String }, // Start time of the trip (if provided)
  start_date: { type: String }, // Start date of the trip (format: YYYYMMDD)
  schedule_relationship: { type: String }, // Schedule relationship status
  route_id: { type: String }, // Route ID the trip belongs to
  direction_id: { type: Number }, // Direction ID
  stops: [ // Array of stop information for this trip
    {
      stop_sequence: { type: Number }, // Each stop includes its sequence order in the trip
      stop_id: { type: String }, // Stop ID identifying the station or location
      arrival_delay: { type: Number }, // Delay in seconds for arrival at this stop
      schedule_relationship: { type: String }, // Schedule relationship specific to this stop
    },
  ],
  vehicle_id: { type: String }, // Vehicle ID if available
  timestamp: { type: String }, // Timestamp of the API data snapshot
});
// Export the TransportData model to be used in the app
module.exports = mongoose.model("TransportData", TransportDataSchema);
