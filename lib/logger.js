'use strict'
/**
 * Sets up bunyan logger for the app
 * Options include...
 * 	- logLevel : set the log level
 * 	- name: name of the application
 * 	- captureLogs: (boolean) whether logs should be captured through loggly
 * 	- logentriesToken: logentries token if logs need to be captured
 */
var bunyan = require('bunyan'),
  logentries = require('r7insight_node'),
  _ = require('lodash')

module.exports = function(options) {
  var opts = {
    name: options.name,
    level: options.level,
    streams: options.streams || [{stream: process.stdout}]
  }
  // capture logs ?
  if (_.get(options, 'captureLogs', 'false').toLowerCase() === 'true') {
    var leStream = logentries.bunyanStream({ token: options.logentriesToken, region: 'us' })
    opts.streams.push(leStream)
  }

  var logger = bunyan.createLogger(opts)
  return logger
}
