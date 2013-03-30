var http = require("q-io/http"),
	YammerPushAPI = require("../lib/apiclient");

var token = "TBD";

var configAll = {
	type: "all",
}

module.exports.testHandshake = function(test) {
	test.expect(1);

	var client = new YammerPushAPI.Client(token, configAll);
	client.doHandshake().then(function() {
		test.ok(true);
		test.done();
	}, function(error) {
		test.ok(false);
		console.log("Error: " + error);
		test.done();
	});
}