var http = require("q-io/http"),
	YammerPushAPI = require("../lib/apiclient"),
	config = require("./config");

var configAll = {
	type: "all",
}

module.exports.testHandshake = function(test) {
	test.expect(1);

	var client = new YammerPushAPI.Client(config.token, configAll);
	client.doHandshake().then(function() {
		test.ok(true);
		test.done();
	}, function(error) {
		test.ok(false);
		console.log("Error: " + error);
		test.done();
	});
}