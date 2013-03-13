/**
 * Mock functionality for the Yammer Push API client
 */
var util = require('util'),
    events = require('events'),
    fs = require('fs'),
    log = require('winston');

module.exports = (function() {

    function MockYammerPushAPI(config) {
        events.EventEmitter.call(this);

        // used to hold our interval handler
        this.interval = null;    

        this.config = config;        

        // load the file with the mock data
        this.mockData = JSON.parse(readTemplateFile(__dirname + "/data/data.json"));
    }

    util.inherits(MockYammerPushAPI, events.EventEmitter);

    MockYammerPushAPI.prototype.start = function() {
        log.info("Starting mock Yammer PUSH API client");         
        var self = this;

        this.interval = setInterval(function() {
            log.debug("Sending mock data");
            self.emit("data", self.mockData);
        }, this.config.delay);
    }

    function readTemplateFile(file) {
        return(fs.readFileSync(file))
    }

    return MockYammerPushAPI;
})();