'use strict'

var authorizer = require('../authorizer/')

module.exports = function(action, options) {
  options = options || {}
  return function(req, res, next) {
    return authorizer.can(req, action)
      .then(() => {
        next()
      }).catch((err) => {
        err = err || new Error(info || 'You don\'t have permissions to perform this action')
        err.status = authorizer.getDeniedStatusCode()
        next(err)
      })
  }
}
