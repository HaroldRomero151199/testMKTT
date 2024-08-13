require('dotenv').config();

const config = {
  host: process.env.MQTT_HOST || 'localhost',
  port: process.env.MQTT_PORT,
  clientId: process.env.MQTT_CLIENT,
  // username: "harold",
  // password: "Harold151199",
};

module.exports = config
