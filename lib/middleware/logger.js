'use strict';

import WinstonContext from 'winston-context'

module.exports = function logRequest(options) {
  var logger = options.logger

  return (req, res, next) => {
    var id = req.id
    var now = Date.now()
    var startOpts = {
      method: req.method,
      url: req.url,
    };

    // Create a per-request child
    req.log = ctxLogger = new WinstonContext(logger, '', {
      id: req.id
    })
    req.log.info('start request', startOpts)

    var time = process.hrtime()
    res.on('finish', function responseSent() {
      var diff = process.hrtime(time)
      req.log.info('end request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        duration: diff[0] * 1e3 + diff[1] * 1e-6
      })
    })

    next()
  };
};
