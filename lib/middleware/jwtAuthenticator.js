'use strict'

var config = require('config'),
  util = require('../util')(config),
  authVerifier = require('../auth/verifier'),
  _ = require('lodash')

module.exports = function (options) {
  // retrieve secret from options or from config
  let secret = _.get(options, "authSecret", config.get('authSecret'))
  let validIssuers = JSON.parse(_.get(options, "validIssuers", config.get('validIssuers')))
  if (!secret || secret.length === 0) {
    throw new Error('Auth secret not provided')
  }
  if (!validIssuers || validIssuers.length === 0) {
    throw new Error('JWT Issuers not configured')
  }

  let verifier = authVerifier(validIssuers)

  return function (req, res, next) {
    // check header
    var token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1]
    }
    // decode token
    //TODO get auth secret from KMS
    if (token) {

      verifier.validateToken(token, secret, (err, decoded) => {
        if (err) {
          res.status(403)
            .json(util.wrapErrorResponse(req.id, 403, err.message))
          res.send()
        }
        else {
          // if everything is good, save to request for use in other routes
          req.authUser = decoded
          req.authUser.userId = _.parseInt(_.find(req.authUser, (value, key) => {
            return (key.indexOf('userId') !== -1)
          }))
          req.authUser.handle = _.find(req.authUser, (value, key) => {
              return (key.indexOf('handle') !== -1)
          })
          req.authUser.roles = _.find(req.authUser, (value, key) => {
              return (key.indexOf('roles') !== -1)
          })

          let scopes = _.find(req.authUser, (value, key) => {
            return (key.indexOf('scope') !== -1)
          })
          if (scopes) {
            req.authUser.scopes = scopes.split(' ')
            
            let grantType = _.find(decoded, (value, key) => {
              return (key.indexOf('gty') !== -1)
            })
            if (grantType === 'client-credentials' && 
                !req.authUser.userId && 
                !req.authUser.roles) {
              req.authUser.isMachine = true
            }
          }

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
