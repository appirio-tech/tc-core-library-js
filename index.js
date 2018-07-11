'use strict'

exports = module.exports = {

  // ---------------------------
  // register middlewares
  // ---------------------------
  middleware: {
    jwtAuthenticator: require('./lib/middleware/jwtAuthenticator'),
    logger: require('./lib/middleware/logger'),
    permissions: require('./lib/middleware/permissions')
  },

  Authorizer: require('./lib/authorizer'),
  // ---------------------------
  // util
  // ---------------------------
  util: require('./lib/util'),
  logger: require('./lib/logger'),

  auth: {
    m2m: require('./lib/auth/m2m'),
    verifier: require('./lib/auth/verifier')  
  }

}
