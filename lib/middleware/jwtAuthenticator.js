'use strict'

var jwt = require('jsonwebtoken'),
  config = require('config'),
  util = require('../util')(config),
  _ = require('lodash')

module.exports = function(options) {
  // retrieve secret from options or from config
  let secret = _.get(options, "authSecret", config.get('authSecret'))
  if (!secret || secret.length === 0) {
    throw new Error('Auth secret not provided')
  }

  return function(req, res, next) {
    // check header
    var token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1]
    }
    // decode token
    //TODO get auth secret from KMS
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          res.status(403)
            .json(util.wrapErrorResponse(req.id, 403, 'Failed to authenticate token.'))
          res.send()
        } else {
          // if everything is good, save to request for use in other routes
          req.authUser = decoded
          req.authUser.userId = _.parseInt(req.authUser.userId)
          next()
        }
      })
    } else {
      // if there is no token
      // return an error
      res.status(403)
        .json(util.wrapErrorResponse(req.id, 403, 'No token provided.'))
      res.send()
    }
  }
}
