'use strict';
import _ from 'lodash'
module.exports = function(config) {
  let version = _.get(config, 'version', 'v3')

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
      };
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
      var code;
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
      };
      if (totalCount) {
        resp.result.metadata = {
          totalCount: totalCount
        }
      }
      return resp
    }
  }
}
