'use strict';

import chai from 'chai'
import jwtAuth from './jwtAuthenticator'
var expect = chai.expect

var mw = jwtAuth({
  authSecret: "secret"
})


describe('JWT Authenticator', () => {
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
