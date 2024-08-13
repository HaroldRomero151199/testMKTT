const mqtt = require("mqtt");
const mongoose = require('mongoose');
const mqttConfig = require('./config/mqttConfig');
const dbConfig = require('./config/dbConfig');
const Company = require('./models/company');
const logger = require('./logger');

// Conectar a MongoDB
// dbConfig.connectMongoDB();

const client = mqtt.connect(mqttConfig);

mongoose.connect(dbConfig)
.then(() => {
  logger.info('Connected to MongoDB');
  client.on("connect", function () {
    logger.info("Connected to FlashMQ");
    client.subscribe("+/sensors/+/data", { qos: 1 });
  });
})
.catch(err => {
  logger.error('Error connecting to MongoDB', err);
  process.exit(1);
});
  
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
      logger.error("Error processing message:", error);
    }
  });
  
  client.on("close", function () {
    logger.warn("close to FlashMQ");
  });
  
  client.on("disconnect", function (packet) {
    logger.warn("disconnect packet");
    logger.warn(packet);
  });
  
  client.on("offline", function () {
    logger.warn("offline");
  });
  
  client.on("error", function (error) {
    logger.error("MQTT Client Error:", error);
  });
  