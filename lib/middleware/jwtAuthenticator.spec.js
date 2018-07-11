'use strict';

var chai = require('chai'),
  jwtAuth = require('./jwtAuthenticator'),
  expect = chai.expect

var mw = jwtAuth({
  AUTH_SECRET: process.env.TEST_AUTH_SECRET || '',
  VALID_ISSUERS: process.env.TEST_VALID_ISSUERS || ''
})

describe.skip('JWT Authenticator', () => {
  describe('on receiving a request with invalid jwt', () => {
    it('should be return 403 for invalid token', () => {
      expect(false).to.be.ok
    })
  })

  describe('on receiving a request without jwt', () => {
    it('should be return 403 for invalid token', () => {
      expect(false).to.be.ok
    })
  })

  describe('on receiving a request with valid token', () => {
    it('should be return 200 for invalid token', () => {
      expect(false).to.be.ok
    })

    it('should have a valid authUser set', () => {
      expect(false).to.be.ok
    })
  })

})
