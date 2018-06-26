'use strict'

var chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  chaiAsPromised = require("chai-as-promised")

chai.use(chaiAsPromised)

const config = {
  VALID_ISSUERS: '[\"https:\/\/topcoder-newauth.auth0.com\/\",\"https:\/\/api.topcoder-dev.com\"]',
  AUTH0_CLIENT_ID: '5fctfjaLJHdvM04kSrCcC8yn0I4t1JTd',
  AUTH0_CLIENT_SECRET: 'GhvDENIrYXo-d8xQ10fxm9k7XSVg491vlpvolXyWNBmeBdhsA5BAq2mH4cAAYS0x'
}

var m2mAuth = require('../../').auth.m2m
var verifierAuth = require('../../').auth.verifier
describe('Machine to Machine token', () => {

  it('should be initialized', () => {
    m2mAuth.should.exist
  })

  describe('get machine token', () => {

    var m2m = m2mAuth({
      tokenCacheTime : 0
    })
    var verifier = verifierAuth(config.VALID_ISSUERS)

    it('should be resolved if client id and client secret is correct', (done) => {
      m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET).should.be.fulfilled.notify(done)
    })

    it('should be rejected if client id and client secret is wrong', (done) => {
      m2m.getMachineToken(config.AUTH0_CLIENT_ID + 'q', config.AUTH0_CLIENT_SECRET + 'w').should.be.rejected.notify(done)
    })

    it('the generated token should be valid', (done) => {
      m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
        .then((token) => {
          verifier.validateToken(token, '', (err, decoded) => {
            expect(err).to.be.undefined
            expect(decoded).to.not.be.undefined
            expect(decoded).to.not.be.null
            done()
          })
        })
    })
    
    it('the wrong token should be invalid', (done) => {
      m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
        .then((token) => {
          verifier.validateToken(token + 'w', '', (err, decoded) => {
            expect(err).to.not.be.undefined
            expect(decoded).to.be.undefined
            done()
          })
        })
    })

    var m2mCached = m2mAuth({
      tokenCacheTime : 60000
    })

    it('should be generated the same token if it cached', (done) => {
      m2mCached.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
        .then((token1) => {
          m2mCached.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
          .then((token2) => {
            expect(token1).to.equal(token2)
            done()
          })
        })
    })

  })
})
