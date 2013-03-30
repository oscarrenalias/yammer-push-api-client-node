var YammerPushAPI = require('../lib/apiclient'),
	config = require('./config.js'),
	client = new YammerPushAPI.Client(config.oauth_token, { type: "all" });

client.on("data", function(data) {
	console.log("new data received: " + JSON.stringify(data));
})

client.on("error", function(data) {
	console.log("Error received: " + JSON.stringify(data));
})

client.on("fatal", function(response) {
	console.log("Fatal error received: " + response);
})

client.start();
