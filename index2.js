const mqtt = require("mqtt");

const options = {
  host: "52.15.167.220",
  port: 1883,
  clientId: 'serverMQTTjs', 
  // username: "harold",
  // password: "Harold151199",
};

const client = mqtt.connect(options);

// Clientes conectados y desconectados
const connectedClients = new Map();

client.on("connect", function () {
  console.log("Connected to FlashMQ");
  client.subscribe("+/controller/+/conexion",{ qos: 2 });
  client.subscribe("+/controller/+/data",{ qos: 2 });
});

client.on("message", function (topic, message) {
  console.log(`Topic: ${topic}, Message: ${message.toString()}`);
  try {
      const msg = JSON.parse(message.toString());
      const topicParts = topic.split("/");
      const empresa = topicParts[0];
      const deviceId = msg.deviceId;
      if (topic.endsWith("/conexion")) {
        if (msg.status === "connected") {
          connectedClients.set(deviceId, msg.timestamp);
          console.log(`connected: Topic: ${topic}, Message: ${msg}`);
        } else if (msg.status === "disconnected") {
          console.log(`disconected: Topic: ${topic}, Message: ${msg}`);
          connectedClients.delete(deviceId);
        }
      } else if (topic.endsWith("/data")) {
        connectedClients.set(deviceId, msg.timestamp);
        console.log(`data: Topic: ${topic}, Message: ${msg}`);
        saveDataHistory(deviceId, msg);
      }
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

function saveDataHistory(deviceId, data) {
  console.log(`Saving data for ${deviceId}:`, data);
}