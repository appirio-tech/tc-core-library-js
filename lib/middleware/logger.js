'use strict'

module.exports = function logRequest(options, logger) {
  if (!logger) {
    throw new Error('Logger must be provided')
  }

  return (req, res, next) => {
    var startOpts = {
      method: req.method,
      url: req.url,
    }
    // Create a per-request child
    req.log = res.log = logger.child({requestId: req.id})
    req.log.info('start request', startOpts)
    var time = process.hrtime()
    res.on('finish', function responseSent() {
      var diff = process.hrtime(time)
      res.log.info('end request', {
        method: startOpts.method,
        url: startOpts.url,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        duration: diff[0] * 1e3 + diff[1] * 1e-6
      })
    })

    next()
  }
}
