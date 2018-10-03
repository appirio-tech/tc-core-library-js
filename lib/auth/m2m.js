'use strict'
var _ = require('lodash'),
  request = require('request'),
  redis = require('redis')

const ONE_DAY_TIMEMILIS = 86400000

module.exports = function (config) {
  let auth0Url = _.get(config, 'AUTH0_URL', '')
  let auth0Audience = _.get(config, 'AUTH0_AUDIENCE', '')
  let tokenCacheTime = _.get(config, 'TOKEN_CACHE_TIME', ONE_DAY_TIMEMILIS)
  let redisUrl = _.get(config, 'REDIS_URL', '')
  let redisKeyPrefix = _.get(config, 'REDIS_KEY_PREFIX', 'tc-core-js-')

  var cachedToken = {}, cachedTime = {};

  var redisClient = null
  if (!_.isEmpty(redisUrl)) {
    redisClient = redis.createClient(redisUrl)
    redisClient.on("error", function (err) {
      throw new Error("redis client connecting error: " + err)
    });
  }

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

      return new Promise(function (resolve, reject) {

        // We cached the token to cachedToken variable,
        // So we check the variable and the time here.
        let cachedM2MToken = ''
        let redisKey = redisKeyPrefix + clientId

        let setTokenCache = (token) => {
          if (redisClient != null) {
            if (tokenCacheTime) {
              redisClient.set(redisKey, token, 'EX', tokenCacheTime / 1000)
            } else {
              redisClient.set(redisKey, token)
            }
          }
          else {
            cachedToken[clientId] = token
            cachedTime[clientId] = new Date().getTime()
          }
        }

        let generateToken = (cachedM2MToken) => {
          if (cachedM2MToken) {
            resolve(cachedM2MToken)
          }
          else {
            request.post(options, function (error, response, body) {
              if (error) return reject(new Error(error))
              let newM2MToken = body.access_token
              if (newM2MToken) {
                setTokenCache(newM2MToken)
                resolve(newM2MToken)
              }
              else {
                reject(new Error('Unknown Error'))
              }
            })
          }
        }

        // search in cache first   
        if (redisClient != null) {
          redisClient.get(redisKey, function (err, reply) {
            if (reply != null) cachedM2MToken = reply.toString()
            generateToken(cachedM2MToken)
          })
        }
        else {
          if (cachedToken[clientId] && (new Date().getTime() - cachedTime[clientId]) < tokenCacheTime) {
            cachedM2MToken = cachedToken[clientId];
          }
          generateToken(cachedM2MToken)
        }

      })
    },
    closeConnections: () => { if (redisClient != null) redisClient.quit() }
  }
}
