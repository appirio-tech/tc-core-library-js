'use strict'
var _ = require('lodash'),
  axios = require('axios')

module.exports = function(config) {
  let version = _.get(config, 'version', 'v3')
  var _httpClient = null

  return {
    /**
     * Wrap error responses according to
     * V3 API specification
     * @param  reqId  request Id
     * @param  status  status of http response
     * @param  message error message
     */
    wrapErrorResponse: (reqId, status, message) => {
      return {
        id: reqId,
        version: version,
        result: {
          success: false,
          status: status,
          content: {
            message: message
          }
        }
      }
    },
    /**
     * Wrap success response
     * @param  string reqId  request Id
     * @param  content  response body
     * @param  totalCount metadata
     * @param  status  status of http response
     * @param  message error message
     */
    wrapResponse: (reqId, content, totalCount, status, err) => {
      // determine status
      var code
      if (err) {
        code = err.status
      } else if (status) {
        code = status
      } else {
        code = 200
      }
      var resp = {
        id: reqId,
        version: version,
        result: {
          success: !err,
          status: code,
          content: content
        }
      }
      if (!totalCount) {
        totalCount = _.isArray(content) ? content.length : 1
      }
      resp.result.metadata = {totalCount}

      return resp
    },

    /**
     * Returns a promise based http client
     * @param  {request} req request object, can be null
     * @return {object}     http client
     */
    getHttpClient: (req) => {
      var httpClient = axios.create()
      if (req) {
        httpClient.defaults.headers = httpClient.defaults.headers || {common: {}}
        httpClient.defaults.headers.common['X-Request-Id'] = req.id
      }
      httpClient.defaults.timeout = 3000
      return httpClient
    }
  }
}
