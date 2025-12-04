'use strict'
var _ = require('lodash'),
  axios = require('axios'),
  jwt = require('jsonwebtoken')

const getTokenExpiryTime = function (token) {
  let expiryTime = 0
  if (token) {
    let decodedToken = jwt.decode(token)
    let expiryTimeInMilliSeconds = (decodedToken.exp - 60) * 1000 - (new Date().getTime())
    expiryTime = Math.floor(expiryTimeInMilliSeconds / 1000)
  }
  return expiryTime
}

const cachedToken = {}

module.exports = function (config) {
  const auth0Url = _.get(config, 'AUTH0_URL')
  const auth0Audience = _.get(config, 'AUTH0_AUDIENCE')
  const auth0ProxyServerUrl = _.get(config, 'AUTH0_PROXY_SERVER_URL', auth0Url)
  const authScope = _.get(config, 'AUTH_SCOPE')
  const authProvider = _.get(config, 'AUTH_PROVIDER')
  const contentType = _.get(config, 'AUTH_CONTENT_TYPE')

  const options = {
    url: auth0ProxyServerUrl,
    headers: { 'content-type': 'application/json' },
    data: {
      grant_type: 'client_credentials',
      client_id: '',
      client_secret: '',
      auth0_url: auth0Url
    },
  }

  if (!_.isUndefined(auth0Audience)) {
    options.data.audience = auth0Audience
  }
  if (!_.isUndefined(authScope)) {
    options.data.scope = authScope
  }
  if (!_.isUndefined(authProvider)) {
    options.data.provider = authProvider
  }
  if (!_.isUndefined(contentType)) {
    options.data.content_type = contentType
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

      options.data.client_id = clientId
      options.data.client_secret = clientSecret

      return new Promise(function (resolve, reject) {

        // We cached the token to cachedToken variable,
        // So we check the variable and the time here.
        let appCachedToken = cachedToken[clientId]
        let appCachedTokenExpired = false

        //Check the token expiry  
        if (appCachedToken) {
          if (getTokenExpiryTime(appCachedToken) <= 0) {
            appCachedTokenExpired = true
          }
        }
        if (!appCachedToken || appCachedTokenExpired) {
          axios({...options, method: 'post'})
            .then(response => {
              const body = response.data;
          
              if (body.access_token) {
                cachedToken[clientId] = body.access_token;
                resolve(cachedToken[clientId]);
              } else if (body.error) {
                reject(new Error(
                  body.error + ': ' +
                  ' ;Please check your auth credential i.e. AUTH0_URL, AUTH0_CLIENT_ID,' +
                  ' AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE, AUTH0_PROXY_SERVER_URL'
                ));
              } else {
                reject(new Error(JSON.stringify(body)));
              }
            })
            .catch(error => {
              reject(new Error(error));
            });
        }
        else {
          resolve(appCachedToken)
        }
      })
    }

  }
}
