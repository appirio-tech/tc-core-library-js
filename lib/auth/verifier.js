'use strict'
const jwt = require('jsonwebtoken'),
  jwksRSA = require('jwks-rsa'),
  ms = require('millisecond')

const jwksClients = {} // in global scope

module.exports = function(validIssuers, jwtKeyCacheTime) {

  return {

    /**
     * Verify jwt token
     * V3 API specification
     * @param  token  the token to verify
     * @param  secret  secret code (Optional), should be provided if alg is HS256
     * @param  callback  callback to pass responses
     */
    validateToken: (token, secret, callback) => {
      // Decode it first
      let decodedToken = jwt.decode(token, {complete: true})

      // Check if it's HS or RS

      if (decodedToken && decodedToken.header){
        if (decodedToken.header.alg === "RS256") {
            if (validIssuers.indexOf(decodedToken.payload.iss) === -1){
              callback(new Error('Invalid token issuer.'))
            } else {
              // Get the key id (kid)
              let kid = decodedToken.header.kid
              // Get the public cert for verification then verify
              if (!jwksClients[decodedToken.payload.iss]){
                jwksClients[decodedToken.payload.iss] = jwksRSA({
                  cache: true,
                  cacheMaxEntries: 5, // Default value
                  cacheMaxAge: ms(jwtKeyCacheTime), // undefined/0 means infinte
                  jwksUri: decodedToken.payload.iss + '.well-known/jwks.json'
                })
              }
              jwksClients[decodedToken.payload.iss].getSigningKey(kid, (err, key) => {
                if (err) {
                  callback(new Error('Invalid Token.' + err))
                } else {
                  jwtVerify(token, key.publicKey, callback)
                }
              })
            }
        }

        if (decodedToken.header.alg === "HS256") {
            jwtVerify(token, secret, callback)
        }
      } else {
        callback(new Error('Invalid Token.'))
      }

    }
  }

  function jwtVerify(token, secretOrCert, callback) {  // verifies secret and checks exp
    jwt.verify(token, secretOrCert, (err, decoded) => {
      if (err) {
        callback(new Error('Failed to authenticate token.'))
      } else if (validIssuers.indexOf(decoded.iss) === -1) {
        // verify issuer
        callback(new Error('Invalid token issuer.'))
      } else {
        callback(undefined, decoded)
      }
    })
  }
}
