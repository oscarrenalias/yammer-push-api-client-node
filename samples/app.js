var YammerPushAPI = require('yammer-push-api-client'),
	config = require('./config.js')

var client = new YammerPushAPI.Client(config.oauth_token, { type: "all" });

client.on("data", function(data) {
	console.log("new data received: " + JSON.stringify(data));
})

client.on("fatal", function(response) {
	console.log("Error received: " + response.statusCode);
})

client.start();
