const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://test.mosquitto.org");

function subscribe() {
    client.subscribe("presence", (err) => {
        if (!err) {
            client.publish("presence", "Hello mqtt");
        }
    });
}

function publish (topic, message) {
    // message is Buffer
    console.log(message.toString());
    client.end();
}

client.on("connect", subscribe);

client.on("message", publish );