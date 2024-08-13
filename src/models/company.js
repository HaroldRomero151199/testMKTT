const mongoose = require('mongoose');
const { sensorSchema } = require('./sensor');

const companySchema = new mongoose.Schema({
  _id: String,
  sensors: {
    type: Map,
    of: sensorSchema
  },
}, { versionKey: false });

module.exports = mongoose.model('Company', companySchema);
