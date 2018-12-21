'use strict'
var _ = require('lodash'),
  request = require('request')

const ONE_DAY_TIMEMILIS = 86400000
let cachedToken={}, cachedTime={};

module.exports = function(config) {
  let auth0Url = _.get(config, 'AUTH0_URL', '')
  let auth0Audience = _.get(config, 'AUTH0_AUDIENCE', '')
  let tokenCacheTime = _.get(config, 'TOKEN_CACHE_TIME', ONE_DAY_TIMEMILIS)

  return {

    /**
     * Generate machine to machine token from Auth0
     * V3 API specification
     * @param  clientId  client Id provided from Auth0
     * @param  clientSecret  client secret provided from Auth0
     * @return  Promise  promise to pass responses
     */
    getMachineToken: (clientId, clientSecret) => {

      var options = {
        url: auth0Url,
        headers: { 'content-type': 'application/json' },
        body: {
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          audience: auth0Audience
        },
        json: true
      }
      
      return new Promise(function(resolve, reject) {

        // We cached the token to cachedToken variable,
        // So we check the variable and the time here.
        if (cachedToken[clientId] && (new Date().getTime() - cachedTime[clientId]) < tokenCacheTime) {
          resolve(cachedToken[clientId])
        }
        else {
          request.post(options, function (error, response, body) {
            if (error) {
              return reject(new Error(error))
            }
            if (body.access_token) {
              cachedToken[clientId] = body.access_token
              cachedTime[clientId] = new Date().getTime()
              resolve(cachedToken[clientId])
            }
            else {
              reject(new Error('Unknown Error'))
            }
          })
        }

      })
    }

  }
}
