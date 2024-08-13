const mqtt = require('mqtt');

const clientId = '10:06:1C:83:E7:B2'
const companyId = 'empresa1'

const options = {
  host: '52.15.167.220',
  port: 1883,
  keepalive: 60, 
  clientId: clientId, 
  will: {
    topic: `${companyId}/sensors/${clientId}/conexion`,
    payload: JSON.stringify({ 
      deviceId: clientId, 
      status: 'disconnected', 
      timestamp: new Date().toISOString() }),
    qos: 1,
    retain: false
  }
};

const client = mqtt.connect(options);

client.on('connect', function () {
  console.log('Connected to FlashMQ');
  client.subscribe(`${companyId}/sensors/${clientId}/config`);
  setInterval(() => {
    const data = {
      temperature: 5.5,
      latitude: 40.7128, 
      longitude: -74.0060,
      voltage:1793,
      timestamp: new Date().toISOString()
    };
    client.publish(`${companyId}/sensors/${clientId}/data`, 
      JSON.stringify(data),
      { qos: 1, retain: false }
    );
    console.log('publish ');
  }, 20000); 
});

client.on('message', function (topic, message) {
  const msg = JSON.parse(message.toString());
  console.log(`Topic: ${topic}, Message: ${msg}`);
  if (topic === `${companyId}/sensors/${clientId}/config`) {
    const config = msg;
    // Implementa la lógica para aplicar la nueva configuración
  }
});

client.on('close', function () {
  console.log('Connection closed');
  const disconnectMessage = JSON.stringify({ 
      deviceId: clientId, 
      status: 'disconnected', 
      timestamp: new Date().toISOString() 
    });
    client.publish(`${companyId}/controller/${clientId}/conexion`, 
      disconnectMessage, 
      { qos: 1, retain: false }
    );
});

client.on('offline', function () {
  console.log('Client is offline');
});

client.on('error', function (error) {
  console.error('MQTT Client Error:', error);
});

function getTemperature() {
  return 22.5; 
}

function getLocation() {
  return { lat: 40.7128, lon: -74.0060 };
}