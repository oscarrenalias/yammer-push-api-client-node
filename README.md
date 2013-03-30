yammer-push-api-client-node
===========================

This is an implementation of a client for Yammer's Bayeux push-based API, described here: https://developer.yammer.com/realtime. The implementation works with Node.js 0.6.x and newer.

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
var YammerPushAPI = require('yammer-push-api-client');
```

Second, create a new client:

```
var client = YammerPushAPI.Client("YOUR YAMMER OAUTH 2.0 TOKEN", { type: "all" });
```

Then, implement listener functiosn for the data and fatal events:

```
client.on("data", function(data) {
	console.log("new data received: " + JSON.stringify(data));
})

client.on("fatal", function(response) {
	console.log("Fatal error: " + response);
})

client.on("error", function(response) {
	console.log("Error: " + response);
})
```

After all the previous steps are in place, the client can be started:

```
client.start();
```

The client is constantly running so the application will not exit unless there is an unhandled exception.

Logging
=======
Logging is implemented via custom logging categories and Winston. By default debug logging is enabled and
delivered to the console logger. 

For example, in order to set the logging level to 'error' and disable colours, add these to your code after
importing the module via ```require```:

```
var winston = require('winston');
with(winston.loggers.get("net.renalias.yammer.pushapi")) {
	transports.console.level = 'silly';	// Increase log level
    transports.console.colorize = true;	// Colorize messages
    add(winston.transports.File, {		// Add an additional log target
		level: "debug",
		filename: './debug.log' 
	})
}
```

The API client uses ```net.renalias.yammer.pushapi``` while the HTTP client used for making requests uses
```net.renalias.yammer.pushapi.http```

Mock client
===========
During development of clients that use this API it may be useful to use a reliable mechanism to receive a constant stream of messages, as opposed
to wait for someone on our network to post something. For that purpose, the library provides a mock implementation that will generate data based on a
configurable schedule.

The mock implementation behaves just like the real client:

```
var YammerPushAPI = require('yammer-push-api-client');
var client = YammerPushAPI.Mock({delay: 5000});

client.on("data", function(data) {
  ...
});
```

This will generate a message every 5 seconds. The body of the message is provided in the module's lib/mock/data/data.json, and it currently is
not configurable.

License
=======
Apache Software License 2.0: http://www.apache.org/licenses/LICENSE-2.0

Changelog
=========
* Version 1.0.0: Rewritten the client to use the Q and Q-IO promise libraries for connectivity, which greatly simplified the code.
* Version 0.2.3: Cleaned up the test application and added some documentation about it.
* Version 0.2.2: Cleaner test data provided from the mock API module.
* Version 0.2.1: Improved error reporting in case we catch an exception.
* Version 0.2.0: Added the mock client, changed the interface so that YammerPushAPIClient now has two main functions: Client() and Mock() that act as factorie to return the correct implementation depending on the needs.
* Version 0.1.1: Corrected the documentation and example
* Version 0.1.0: Initial version

TODO
====
* Clean up and refactor some the code, try to break it down into smaller functions
* Currently Yammer's advice for the reconnect interval is followed, but the socket timeout is not
