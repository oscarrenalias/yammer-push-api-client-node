yammer-push-api-client-node
===========================

This is an implementation of a client for Yammer's Bayeux push-based API, described here: https://developer.yammer.com/api/realtime.html. The implementation works with Node.js 0.6.x and newer.

There is a sample application in the samples/ folder. Edit file samples/config.js, provide your own Yammer OAuth 2.0 and then run it with ```node testapp.js````.

The module is available via npm using 'yammer-push-api-client' as the module name: https://npmjs.org/package/yammer-push-api-client

Features
========
The module supports reading real-time data with the API from three different enpoints: [messages](https://developer.yammer.com/api/#message-viewing) (or rather, the All Company feed), [topics](https://developer.yammer.com/api/#topics) and [groups](https://developer.yammer.com/api/#groups). The endpoint selection is via the second parameter object provided to the YammerPushAPI constructor; use values "all", "topics" and "groups" for the "type" key.

The module will try to follow the advice provided by Yammer with regards to intervals between connections as well as socket timeouts (but see the TODO section). Otherwise no delays are used between connectiosn and Node's default socket timeout is used.

Requirements
============
You will need a valid OAuth 2.0 token from Yammer. This module will not generate a token for your application, so applications are expected to use other Yammer APIs to generate their own tokens.

How to use
==========
The module implements an event emitter using two specific events: 'data' and 'fatal'. The first one is triggered whenever new data was received from the connection while the second is triggered when an unrecoverable error happened, and it gives applications an opportunity to clean up rather than throw an exception upwards.

In your package.json file, add the following dependency:

```
"dependencies": {
	"yammer-push-api-client": ">= 0.0.0"
}
```

Then run ```npm install``` so that npm can automatically retrive the module as well as its dependencies.

Import the required modules:

```
var YammerPushAPI = require('../../yammer-push-api');
```

Second, create a new client:

```
var client = new YammerPushAPI("YOUR YAMMER OAUTH 2.0 TOKEN", { type: "all" });
```

Then, implement listener functiosn for the data and fatal events:

```
client.on("data", function(data) {
	console.log("new data received: " + JSON.stringify(data));
})

client.on("fatal", function(response) {
	console.log("Error: " + response.statusCode);
})
```

After all the previous steps are in place, the client can be started:

```
client.start();
```

The client is constantly running so the application will not exit unless there is an unhandled exception.

License
=======
Apache Software License 2.0: http://www.apache.org/licenses/LICENSE-2.0
 
TODO
====
* Clean up and refactor some the code, try to break it down into smaller functions
* Currently Yammer's advice for the reconnect interval is followed, but the socket timeout is not