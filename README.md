# tc-core-library-js

Library that contains utils, middlewares etc that can be used by all Topocder Services.

## Logger
Sets up a *Bunyan* logger (https://github.com/trentm/node-bunyan) to use with the application logging. If `captureLogs` is enabled logs will be pushed to Logentries using [le_node](https://github.com/logentries/le_node#using-with-bunyan) library.

_*Note:* Bunyan logger was chosen over winston because winston logger tends to flatten json metadata logged along with strings thus overwriting values with the same key name._ You'll have to obtain a token for your app to integrate with logentries


## Util
Functions to wrap response based on V3 API specification.

## Middleware
* jwtAuthenticator

  Authenticates the JWT passed in the request header (`Authorization: Bearer eHsdfsdf3234SSDF... `). `AUTH_SECRET` used to decrypt JWT can be passed in.
  If token is missing, invalid or expired middleware will return a HTTP 403 status. If authenticated, request object is annotated with 'authUser' object (JWT payload) which contains userId and users' roles..

* logger

  logger middleware to be used along with previously described bunyan logger that logs incoming request and response along with the response time and a requestId.
  RequestId is read from 'X-Request-Id' header. In case the request header is not present a unique request id is generated. *A child logger is attached to both request & response objects* for convenience. Please use this logger as it appends requestId to all logs associated with this request.

* permissions

  Based on attribute based access control, this middleware exposes a can() function that
  takes in an request object and a action to evaluate the policy associated with that action.
  Middleware assumes policies are already defined beforehand.
