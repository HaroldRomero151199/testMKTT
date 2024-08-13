const mqtt = require("mqtt");

const options = {
  host: "52.15.167.220",
  port: 1883,
  clientId: 'serverMQTTjs', 
  // username: "harold",
  // password: "Harold151199",
};

const mongoose = require('mongoose');
const client = mqtt.connect(options);

mongoose.connect('mongodb://localhost:27017/kryosMQTT')
.then(() => {
  console.log('Connected to MongoDB');
  client.on("connect", function () {
    console.log("Connected to FlashMQ");
    client.subscribe("+/sensors/+/data", { qos: 1 });
  });
})
.catch(err => {
  console.error('Error connecting to MongoDB', err);
  process.exit(1);
});

const measurementSchema = new mongoose.Schema({
  temperature: Number,
  latitude: Number,
  longitude: Number,
  voltage: Number,
},{_id: false});

const sensorSchema = new mongoose.Schema({
  measurements: {
    type: Map,
    of: measurementSchema
  }
});

const companySchema = new mongoose.Schema({
  _id: String,
  sensors: {
    type: Map,
    of: sensorSchema
  },
},{ versionKey: false });

const Company = mongoose.model('companies', companySchema);

client.on("message", async function (topic, message) {
  console.log(`Topic: ${topic}, Message: ${message.toString()}`);
  try {
    const data = JSON.parse(message.toString());
    const topicParts = topic.split("/");
    const companyId = topicParts[0];
    const sensorId = topicParts[2];
    const timestamp = new Date(data.timestamp).getTime().toString(); // Usar timestamp como ID

    const update = {
      [`sensors.${sensorId}.measurements.${timestamp}`]: {
        latitude: data.latitude,
        longitude: data.longitude,
        temperature: data.temperature,
        voltage: data.voltage
      }
    };

    await Company.updateOne(
      { _id: companyId },
      { $set: update },
      { upsert: true } 
    );

    console.log('Data saved to MongoDB');
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

client.on("close", function () {
  console.log("close to FlashMQ");
});

client.on("disconnect", function (packet) {
  console.log("disconnect packet");
  console.log(packet);
});

client.on("offline", function () {
  console.log("offline");
});

client.on("error", function (error) {
  console.error("MQTT Client Error:", error);
});
