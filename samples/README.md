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

If connection was successful, some debug log should be output to the console:

```
debug: Starting connection with endpointUrl = /api/v1/messages.json token = some-oauth-token
debug: Retrieving meta real-time information
info: Performing handshake
debug: Real time URI: https://94.rt.yammer.com/cometd/
debug: Channel Id: MTo1Mzg6NTM4
debug: Authorization token: BRv9r4rU+D0WyvfrEVlxW/skv2k4S7gRQInYW/SGKq14nKtWKi1OLVKyMjIytTS1sNBRykstKc8vylayMjUG8lIrCjKLKpWsDI3NzA0sTc0szWoBeYUOYA==
debug: [{"ext":{"token":"BRv9r4rU+D0WyvfrEVlxW/skv2k4S7gRQInYW/SGKq14nKtWKi1OLVKyMjIytTS1sNBRykstKc8vylayMjUG8lIrCjKLKpWsDI3NzA0sTc0szWoBeYUOYA=="},"version":"1.0","minimumVersion":"0.9","channel":"/meta/handshake","supportedConnectionTypes":["long-polling"],"id":2}]
info: Handshake successful. Performing subscription.
debug: We will use client id = 1nwhz1ahidsdrvto8sm6j396vvxbva
debug: Subscription request data = [{"channel":"/meta/subscribe","subscription":"/feeds/MTo1Mzg6NTM4/primary","id":3,"clientId":"1nwhz1ahidsdrvto8sm6j396vvxbva"},{"channel":"/meta/subscribe","subscription":"/feeds/MTo1Mzg6NTM4/secondary","id":3,"clientId":"1nwhz1ahidsdrvto8sm6j396vvxbva"}]
debug: Subscription response: [{"id":"3","subscription":"/feeds/MTo1Mzg6NTM4/primary","successful":true,"channel":"/meta/subscribe"},{"id":"3","subscription":"/feeds/MTo1Mzg6NTM4/secondary","successful":true,"channel":"/meta/subscribe"}]
info: Starting long polling connection cycle...
debug: Opening new connnection
debug: Processing data...
info: Found advice data in response: [object Object]
info: Using timeout = 30000, interval = 0
debug: Sending data to listeners: [{"id":"4","successful":true,"advice":{"interval":0,"reconnect":"retry","timeout":30000},"channel":"/meta/connect"}]
new data received: [{"id":"4","successful":true,"advice":{"interval":0,"reconnect":"retry","timeout":30000},"channel":"/meta/connect"}]
debug: Connection closed; opening again (interval = 0)
debug: Opening new connnection
```