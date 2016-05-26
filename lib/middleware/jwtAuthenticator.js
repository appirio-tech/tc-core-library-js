'use strict';

import jwt from 'jsonwebtoken'
import util from '../util'

module.exports = function(config) {
  return function(req, res, next) {
    // check header
    var token;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1]
    }
    // decode token
    //TODO get auth secret from KMS
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, config.authSecret, (err, decoded) => {
        if (err) {
          res.status(403)
              .json(util.wrapErrorResponse(req.id, 403, 'Failed to authenticate token.'))
          res.send()
        } else {
          // if everything is good, save to request for use in other routes
          req.authUser = decoded;
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
};
