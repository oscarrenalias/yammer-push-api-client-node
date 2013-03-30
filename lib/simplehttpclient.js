/**
 * Wrapper around the Q and Q-IO HTTP functionality that implements some shorthand methods
 * to make dealing with GET and POST requests easier
 */
var Q = require("q"),
    winston = require("winston");

// Set up logging
var logger = (function(logger) {
    logger.transports.console.level = "debug";
    logger.transports.console.colorize = true;
    return(logger);
})(winston.loggers.get("net.renalias.yammer.pushapi.http"));

function SimpleHttpClient() {
    this.http = require("q-io/http");
}

SimpleHttpClient.prototype.get = function(url) {
    return(this.http.read(url));
};

SimpleHttpClient.prototype.getAsJson = function(url) {
    return(this.get(url).then(function(body) {
        return(JSON.parse(body));
    }));
};

SimpleHttpClient.prototype.postAsJson = function(url, body) {
    return(this.post(
        url,
        JSON.stringify(body),
        { "Content-Type": "application/json" }
    ).then(function(body) {
        return(JSON.parse(body));
    }));
};  

SimpleHttpClient.prototype.post = function(url, body, headers) {
    var requestObject = {
            url: url,
            method: "POST",
            headers: headers,
            body: [ body ]
    };

    logger.debug("Sending POST request = " + body);

    var self = this;
    return Q.when(self.http.request(requestObject), function (response) {
        if (response.status !== 200){
            var error = new Error("HTTP request failed with code " + response.status);
            error.response = response;
            throw error;
        }
        return Q.post(response.body, 'read', []);
    });    
};

module.exports = SimpleHttpClient;