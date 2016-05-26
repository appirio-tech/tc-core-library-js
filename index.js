'use strict';

import jwtAuthenticator from './lib/middleware/jwtAuthenticator'
import logger from './lib/middleware/logger'
import util from './lib/util'



exports = module.exports = function(config) {
  return {
    // ---------------------------
    // register middlewares
    // ---------------------------
    middleware: {
      jwtAuthenticator: jwtAuthenticator(config),
      logger: logger(config)

    },

    util: util(config)

  }

}
