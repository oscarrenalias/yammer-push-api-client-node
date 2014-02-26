This is a small demo application that will connect to the Yammer real-time push API and display all messages received in the console.

Requirements
============
The only requirement besides Node.js and npm is a valid OAuth 2.0 provisioned from Yammer, as the library does not provide any mechanisms to do so and it must provisioned using alternative mechanisms.

Getting started
===============
First, install the module dependencies via npm:

```
npm install
```

Then edit config.js and set ```exports.oauth_token``` to your OAuth 2.0 key:

```
exports.oauth_token = "some-oauth-token"
```

Now the application can be started:

```
node app.js
```

If connection was successful, some debug log will be output to the console, including all messages received from the Yammer real-time API.