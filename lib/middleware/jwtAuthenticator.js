'use strict'

var util = require('../util')(),
  authVerifier = require('../auth/verifier'),
  _ = require('lodash')

function getAzpHash(azp) {
  if (!azp || azp.length === 0) {
    throw new Error('AZP not provided.')
  }
  // default offset value  
  let azphash = 100000
  for (let i = 0; i < azp.length; i++) {
    let v = azp.charCodeAt(i)
    azphash += v * (i + 1)
  }
  return azphash * (-1)
}

module.exports = function (options) {
  // retrieve secret from options
  let secret = _.get(options, "AUTH_SECRET") || ''
  let validIssuers = JSON.parse(_.get(options, "VALID_ISSUERS") || '[]')
  let jwtKeyCacheTime = _.get(options, "JWT_KEY_CACHE_TIME", '24h');
  if (!secret || secret.length === 0) {
    throw new Error('Auth secret not provided')
  }
  if (!validIssuers || validIssuers.length === 0) {
    throw new Error('JWT Issuers not configured')
  }

  let verifier = authVerifier(validIssuers, jwtKeyCacheTime)

  return function (req, res, next) {
    // helper to send a 403 response in various environments (Express/Restify/Node http)
    function sendForbidden(message) {
      const body = util.wrapErrorResponse(req.id, 403, message)
      // Express style
      if (typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(403).json(body)
      }
      // Restify style (res.send([code], body))
      if (typeof res.send === 'function') {
        try {
          return res.send(403, body)
        } catch (e) {
          try { return res.send(body) } catch (e2) { /* noop */ }
        }
      }
      // Node http.ServerResponse style
      try { if (typeof res.setHeader === 'function') res.setHeader('Content-Type', 'application/json') } catch (e) { /* noop */ }
      if (typeof res.writeHead === 'function') {
        res.writeHead(403, { 'Content-Type': 'application/json' })
      } else {
        res.statusCode = 403
      }
      if (typeof res.end === 'function') {
        return res.end(JSON.stringify(body))
      }
    }
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
          return sendForbidden(err.message)
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

          if (!req.authUser.email) {
            req.authUser.email = _.find(req.authUser, (value, key) => {
              return (key.indexOf('email') !== -1)
            })
          }

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
              req.authUser.azpHash = getAzpHash(req.authUser.azp)
            }
          }

          next()
        }
      })

    } else {
      // if there is no token
      // return an error
      return sendForbidden('No token provided.')
    }

  }
}
