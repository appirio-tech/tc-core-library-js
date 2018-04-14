'use strict'

var chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  chaiAsPromised = require("chai-as-promised"),
  config = require('config')

chai.use(chaiAsPromised)

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
    var verifier = verifierAuth(config.validIssuers)

    it('should be resolved if client id and client secret is correct', (done) => {
      m2m.getMachineToken(config.auth0ClientId, config.auth0ClientSecret).should.be.fulfilled.notify(done)
    })

    it('should be rejected if client id and client secret is wrong', (done) => {
      m2m.getMachineToken(config.auth0ClientId + 'q', config.auth0ClientSecret + 'w').should.be.rejected.notify(done)
    })

    it('the generated token should be valid', (done) => {
      m2m.getMachineToken(config.auth0ClientId, config.auth0ClientSecret)
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
      m2m.getMachineToken(config.auth0ClientId, config.auth0ClientSecret)
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
      m2mCached.getMachineToken(config.auth0ClientId, config.auth0ClientSecret)
        .then((token1) => {
          m2mCached.getMachineToken(config.auth0ClientId, config.auth0ClientSecret)
          .then((token2) => {
            expect(token1).to.equal(token2)
            done()
          })
        })
    })

  })
})
