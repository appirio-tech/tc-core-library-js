'use strict'

var jwt = require('jsonwebtoken'),
  config = require('config'),
  util = require('../util')(config),
  _ = require('lodash'),
  jwksRSA = require('jwks-rsa'),
  ms = require('millisecond')

module.exports = function (options) {
  // retrieve secret from options or from config
  let secret = _.get(options, "authSecret", config.get('authSecret'))
  let validIssuers = JSON.parse(_.get(options, "validIssuers", config.get('validIssuers')))
  if (!secret || secret.length === 0) {
    throw new Error('Auth secret not provided')
  }
  if (!validIssuers || validIssuers.length === 0) {
    throw new Error('Auth URL not provided')
  }

  let jwksClient = jwksRSA({
    cache: true,
    cacheMaxEntries: 5, // Default value
    cacheMaxAge: ms('10h'), // Default value
    jwksUri: config.get("jwksUri") + '.well-known/jwks.json'
  })

  return function (req, res, next) {
    // check header
    var token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1]
    }
    // decode token
    //TODO get auth secret from KMS
    if (token) {
      // Decode it first
      let decodedToken = jwt.decode(token, {complete: true})

      // Check if it's HS or RS

      if (decodedToken && decodedToken.header){
        if (decodedToken.header.alg === "RS256") {
            // Get the key id (kid)
            let kid = decodedToken.header.kid
            // Get the public cert for verification then verify
            jwksClient.getSigningKey(kid, (err, key) => {
                if (err) {
                    res.status(403)
                        .json(util.wrapErrorResponse(req.id, 403, 'Invalid Token.' + err))
                    res.send()
                } else {
                    jwtVerify(token, key.publicKey)
                }
            })
        }

        if (decodedToken.header.alg === "HS256") {
            jwtVerify(token, secret)
        }
      } else {
        res.status(403)
            .json(util.wrapErrorResponse(req.id, 403, 'Invalid Token.'))
        res.send()
      }

    } else {
      // if there is no token
      // return an error
      res.status(403)
        .json(util.wrapErrorResponse(req.id, 403, 'No token provided.'))
      res.send()
    }

    function jwtVerify(token, secretOrCert) {  // verifies secret and checks exp
      jwt.verify(token, secretOrCert, (err, decoded) => {
        if (err) {
          res.status(403)
            .json(util.wrapErrorResponse(req.id, 403, 'Failed to authenticate token.'))
          res.send()
        } else if (validIssuers.indexOf(decoded.iss) === -1) {
          // verify issuer
          res.status(403)
            .json(util.wrapErrorResponse(req.id, 403, 'Invalid token issuer.'))
          res.send()
        } else {
          // if everything is good, save to request for use in other routes
          req.authUser = decoded
          req.authUser.userId = _.parseInt(_.find(req.authUser, (value, key) => {
            return (key.indexOf('userId') !== -1)
          }))
          next()
        }
      })
    }

  }
}
