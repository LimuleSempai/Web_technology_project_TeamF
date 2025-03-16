const mongoose = require("mongoose");

const TransportDataSchema = new mongoose.Schema({
  trip_id: { type: String, required: true },
  start_time: { type: String },
  start_date: { type: String },
  schedule_relationship: { type: String },
  route_id: { type: String },
  direction_id: { type: Number },
  stops: [
    {
      stop_sequence: { type: Number },
      stop_id: { type: String },
      arrival_delay: { type: Number },
      schedule_relationship: { type: String },
    },
  ],
  vehicle_id: { type: String },
  timestamp: { type: String },
});

module.exports = mongoose.model("TransportData", TransportDataSchema);
