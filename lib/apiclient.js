/**
This method provides a client for Yammer's real-time API.

The client is built as an event emitter so data is delivered to client classes
via the "data", "error" and "fatal" events.

Example usage:

    var YammerPushAPI = require('../lib/apiclient'),
        config = require('./config.js');

    var client = new YammerPushAPI.Client(config.oauth_token, { type: "all" });

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

*/
var util = require('util'),
    Q = require("q"),
    events = require('events'),
    winston = require('winston'),
    MockYammerPushAPI = require('./mock/api'),
    SimpleHttpClient = require("./simplehttpclient");

// Set up logging for this module
var logger = (function(logger) {
    logger.transports.console.level = "silly";
    logger.transports.console.colorize = true;
    return(logger);
})(winston.loggers.get("net.renalias.yammer.pushapi"));    

// Factory function for the client
module.exports.Client = function(oauthToken, config, httpClient) {
    return(new YammerPushAPI(oauthToken, config, httpClient));
};

// Factory function for mock clients
module.exports.Mock = function(config) {
    return(new MockYammerPushAPI(config));
};

function YammerPushAPI(oauthToken, config, httpClient) {
    events.EventEmitter.call(this);

    this.oauthToken = oauthToken;
    this.config = config || { type: "all" };
    this.yammerBase = config.yammerBase || "https://www.yammer.com";
    this.requestId = 0;
    this.params = {};
    this.interval = config.interval || 0;
    this.timeout = config.timeout || 30000;

    var endpointUrl = function() {
        if(config.type == "all")
            return("/api/v1/messages.json");
        else if(config.type == "topic") 
            return("/api/v1/messages/about_topic/" + config.topic + ".json");
        else if(config.type == "group") 
            return("/api/v1/messages/in_group/" + config.group + ".json");
        else {
            logger.warn("Invalid endpoint type '" + config.type + "', using 'all' as default");
            return("/api/v1/messages.json");
        }            
    };

    this.endpointUrl = endpointUrl();    
    // If an HTTP client was injected, use that one; otherwise use the default one
    this.client = httpClient || new SimpleHttpClient();
}

util.inherits(YammerPushAPI, events.EventEmitter);

YammerPushAPI.prototype.nextRequestId = function() {
    this.requestId = this.requestId + 1;
    return(this.requestId);
};

YammerPushAPI.prototype.fatalErrorHandler = function(error) {
    logger.error(error.stack);
    this.emit("fatal", error);
};

YammerPushAPI.prototype.start = function() {
    var self = this;

    return(self.doHandshake().then(function(handshake) {
        self.realtimeResponseHandler.call(self, handshake);
    }).fail(function(error) { 
        self.fatalErrorHandler.call(self, error); 
    }));
};

/**
 Handles and processes responses from the real-time API
*/
YammerPushAPI.prototype.realtimeResponseHandler = function(handshake) {
    var self = this;
    handshake.params[0].id = this.nextRequestId();

    var resp = self.client.postAsJson(handshake.uri, handshake.params).
    then(function(response) {
        logger.debug("Received long-polling response " + JSON.stringify(response));

        var responseType = response[0].successful === false ? "error" : "data";
        self.emit(responseType, response);

        // refresh the interval and timeout
        if(response[0].advice) {
            self.interval = response[0].advice.interval;
            self.timeout = response[0].advice.timeout;

            logger.info("Updating interval: " + self.interval);
            logger.info("Updating timeout: " + self.timeout);
        }
        
        // TODO: could this be a problem?
        setTimeout(function() { self.realtimeResponseHandler(handshake); }, self.interval);
    }).fail(function(error) { 
        self.fatalErrorHandler.call(self, error);
    });
};

/**
 This method executes the handshake as a list of sequential steps as per the Yammer
 protocol (https://developer.yammer.com/realtime/): 

 1. Call one of the normal reading endpoints and
 2. Retrieve the "meta.realtime" structure from the response
 3. Send a handshake request to the cometd server (whose URI is provided in meta.realtime.uri)
 4. Process the response and send a subscribe request
 5. Execute longpoll messages
*/
YammerPushAPI.prototype.doHandshake = function() {
    // Save a reference to 'this' as it gets lost throughout the callbacks. Please note that
    // all calls to other methods in this object will be done using Function.call(self,...) so that
    // they can use a reference to 'this' in their code
    var self = this;

    // Initiate a normal connection to one of the standard reading endpoints
    logger.info("Starting handshake process");
    var req = self.client.getAsJson(this.yammerBase + this.endpointUrl + "?access_token=" + this.oauthToken)
    .then(function(body) {
        return(self.extractRealtimeParameters.call(self, body));
    }).then(function(params) {
        return(self.doHandshakeRequest.call(self, params));
    }).then(function(response) {
        return(self.doSubscribeRequest.call(self, response));
    }).then(function(response) {
        return(self.prepareConnectRequest.call(self, response));
    }).fail(function(error) { 
        self.fatalErrorHandler.call(self, error); 
    });

    return(req);
};

/**
 This method extracts the meta realtime information from a normal request, and returns it
*/
YammerPushAPI.prototype.extractRealtimeParameters = function(body) {
    // look for the meta structure
    this.params = {
        uri: body.meta.realtime.uri,
        channelId: body.meta.realtime.channel_id,
        token: body.meta.realtime.authentication_token
    };          

    logger.info("Real time URI: " + this.params.uri);
    logger.info("Channel Id: " + this.params.channelId);
    logger.info("Authorization token: " + this.params.token);

    return(this.params);    
};

/**
 This method executes a handshake request based on the meta.realtime information
*/
YammerPushAPI.prototype.doHandshakeRequest = function(params) {
    // connection was successful, we can continue
    var handshakeRequestData = [{
        "ext": { "token": params.token },
        "version": "1.0",
        "minimumVersion": "0.9",
        "channel": "/meta/handshake",
        "supportedConnectionTypes": ["long-polling"],
        "id": this.nextRequestId()
    }];

    return(this.client.postAsJson(params.uri, handshakeRequestData));
};

/**
 This method executes a subscription request
*/
YammerPushAPI.prototype.doSubscribeRequest = function(response) {
    logger.debug("Received response to subscribe request: " + JSON.stringify(response));
    this.clientId = response[0].clientId;
    var currentId = this.nextRequestId();
    logger.info("Will use cliend ID = " + this.clientId);

    var subscribeRequest = [
        {
            "channel": "/meta/subscribe",
            "subscription": "/feeds/" + this.params.channelId + "/primary",
            "id": currentId,
            "clientId": this.clientId
        },{
            "channel": "/meta/subscribe",
            "subscription": "/feeds/" + this.params.channelId + "/secondary",
            "id": currentId,
            "clientId": this.clientId
        }
    ];

    return(this.client.postAsJson(this.params.uri, subscribeRequest));
};

/**
 This methods build the structure that will be used across long-polling requests
 */
YammerPushAPI.prototype.prepareConnectRequest = function(response) {
    var connectRequest = [{
        "channel": "/meta/connect",
        "connectionType": "long-polling",
        "id": this.nextRequestId(),
        "clientId": this.clientId
    }];

    return(Q({uri: this.params.uri, params: connectRequest}));
};