const mqtt = require('mqtt');

const clientId = '10:06:1C:83:E7:B0'
const companyId = 'empresa2'

const options = {
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT,
  keepalive: 60, 
  clientId: clientId, 
  will: {
    topic: `${companyId}/controller/${clientId}/conexion`,
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
  client.subscribe(`${companyId}/controller/${clientId}/config`);
  const connectMessage = JSON.stringify({ 
    deviceId: clientId, 
    status: 'connected', 
    timestamp: new Date().toISOString() 
  });
  client.publish(`${companyId}/controller/${clientId}/conexion`, 
    connectMessage, 
    { qos: 1, retain: false }
  );

  setInterval(() => {
    const data = {
      deviceId: clientId,
      temperature: getTemperature(), 
      location: getLocation(),    
      timestamp: new Date().toISOString()
    };
    client.publish(`${companyId}/controller/${clientId}/data`, 
      JSON.stringify(data),
      { qos: 1, retain: false }
    );
    console.log('publish ');
  }, 30000); 
});

client.on('message', function (topic, message) {
  const msg = JSON.parse(message.toString());
  console.log(`Topic: ${topic}, Message: ${msg}`);
  if (topic === `${companyId}/controller/${clientId}/config`) {
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



