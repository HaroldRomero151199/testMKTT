const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  temperature: Number,
  latitude: Number,
  longitude: Number,
  voltage: Number,
}, { _id: false });

const sensorSchema = new mongoose.Schema({
  measurements: {
    type: Map,
    of: measurementSchema
  }
});

module.exports = {
  measurementSchema,
  sensorSchema
};
