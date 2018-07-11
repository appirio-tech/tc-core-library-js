'use strict'

const _ = require('lodash')

class Authorizer {
  constructor() {
    this._policies = {}
    this._deniedStatusCode = null || 403
  }
  getDeniedStatusCode() {
    return this._deniedStatusCode
  }

  setDeniedStatusCode(statusCode) {
    this._deniedStatusCode = statusCode
  }

  setPolicy(action, rule) {
    if (_.isUndefined(action))
      throw new Error('Policy must have an action.')
    if (_.isUndefined(rule))
      throw new Error('Policy ' + action + 'must have a rule')
    this._policies[action] = rule
  }

  getRegisteredPolicies() {
    return _.keys(this._policies)
  }

  unsetPolicy(action) {
    delete this._policies[action]
  }

  can(req, action) {
    var self = this
    return new Promise((resolve, reject) => {

      let policy = _.get(self._policies, action, undefined)

      if (_.isUndefined(policy)) {
        return reject(new Error('Policy for action \'' + action + '\' not defined'))
      }

      if (_.isBoolean(policy)) {
        let err = new Error('You don\'t have permission to perform this action')
        return policy ? resolve(true) : reject(err)
      }

      if (_.isFunction(policy)) {
        return policy(req)
          .then(() => {
            return resolve(true)
          })
          .catch((err) => {
            if (!_.isError(err))
              err = new Error(err)
            return reject(err)
          })
      }

      return reject(new Error('Unknown policy type'))
    })
  }
}

// returning a singleton
module.exports = exports = new Authorizer()
