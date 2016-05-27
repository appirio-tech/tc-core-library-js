'use strict'

exports = module.exports = {

  // ---------------------------
  // register middlewares
  // ---------------------------
  middleware: {
    jwtAuthenticator: require('./lib/middleware/jwtAuthenticator'),
    logger: require('./lib/middleware/logger')

  },
  // ---------------------------
  // util
  // ---------------------------
  util: require('./lib/util'),
  logger: require('./lib/logger')

}
