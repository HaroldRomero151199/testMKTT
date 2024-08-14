const mqtt = require('mqtt');
const mongoose = require('mongoose');
const dbConfig = require('./src/config/dbConfig');
const logger = require('./src/logger');
const Company = require('./src/models/company');

const options = {
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT, 
    clientId: 'configMQTT', 
}    

const companyId = 'empresa3';
const deviceId = '10:06:1C:83:E7:B1';

const configData = {
    criticalMax: -8,
    criticalMin: -20,
    measIntervalSec: 12,
    normalMax: -10,
    normalMin: -17,
    wifiPass: "holaMundo",
    wifiSSID: "holaMundo",
};

const client  = mqtt.connect(options);

const configTopic = `${companyId}/sensors/${deviceId}/config`;

mongoose.connect(dbConfig)
  .then(() => {
    logger.info('Connected to MongoDB');
    client.on("connect", function () {
      logger.info("Connected to FlashMQ");
      client.publish(configTopic, JSON.stringify(configData), { qos: 1 }, (err) => {
        if (err) {
          console.error('Error publicando configuración:', err);
        } else {
          console.log('Configuración publicada en:', configTopic);
        }
      });
      client.subscribe(`+/sensors/+/updated`, { qos: 1 }, (err) => {
        if (err) {
          console.error('Error suscribiéndose al tópico de actualización:', err);
        } else {
          console.log('Suscrito a:', `+/sensors/+/updated`);
        }
      });
    });
  })
  .catch(err => {
    logger.error('Error connecting to MongoDB', err);
    process.exit(1);
  });

client.on("message", async function (topic, message) {
  console.log(`Topic: ${topic}, Message: ${message.toString()}`);
  
  try {
    const updatedConfig = JSON.parse(message.toString());
    const topicParts = topic.split("/");
    const companyId = topicParts[0];
    const sensorId = topicParts[2];

    const update = {
      [`sensors.${sensorId}.config`]: updatedConfig
  };

  const company = await Company.findOne({ _id: companyId });
if (!company) {
    console.error(`No se encontró la compañía con _id: ${companyId}`);
    return;
}

const sensor = company.sensors.get(sensorId);
if (!sensor) {
    console.error(`No se encontró el sensor con _id: ${sensorId} para la compañía ${companyId}`);
    return;
}

  const result = await Company.updateOne(
      { _id: companyId },
      { $set: update },
      { upsert: true }
  );

  if (result.modifiedCount > 0) {
      console.log('Configuración actualizada en MongoDB');
  } else {
      console.error('La configuración no se actualizó en MongoDB, revisa los datos y la estructura.');
  }

  } catch (error) {
    logger.error("Error processing message:", error);
  }
});

client.on('offline', function () {
  console.log('Client is offline');
});

client.on('error', function (error) {
  console.error('MQTT Client Error:', error);
});