const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  temperature: Number,
  latitude: Number,
  longitude: Number,
  voltage: Number,
}, { _id: false });

const configSchema = new mongoose.Schema({
  criticalMax: Number,
  criticalMin: Number,
  measIntervalSec: Number,
  normalMax: Number,
  normalMin: Number,
  wifiPass: String,
  wifiSSID: String,
}, { _id: false });

const sensorSchema = new mongoose.Schema({
  config: configSchema,
  measurements: {
    type: Map,
    of: measurementSchema
  }
});

module.exports = {
  sensorSchema,
  configSchema,
  measurementSchema
};
