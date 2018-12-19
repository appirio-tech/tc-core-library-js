'use strict'

var chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  chaiAsPromised = require("chai-as-promised")

chai.use(chaiAsPromised)

const config = {
  VALID_ISSUERS: process.env.TEST_VALID_ISSUERS || [],
  AUTH0_CLIENT_ID: process.env.TEST_AUTH0_CLIENT_ID || '',
  AUTH0_CLIENT_SECRET: process.env.TEST_AUTH0_CLIENT_SECRET || '',
  AUTH0_URL: process.env.TEST_AUTH0_URL || '',
  AUTH0_AUDIENCE: process.env.TEST_AUTH0_AUDIENCE || '',
  JWT_KEY_CACHE_TIME: '24h',
  AUTH0_PROXY_SERVER_URL: process.env.TEST_AUTH0_PROXY_SERVER_URL
}

var m2mAuth = require('../../').auth.m2m
var verifierAuth = require('../../').auth.verifier
describe('Machine to Machine token', () => {

  it('should be initialized', () => {
    m2mAuth.should.exist
  })

  describe('get machine token', () => {

    var m2m = m2mAuth(config)
    var verifier = verifierAuth(config.VALID_ISSUERS, config.JWT_KEY_CACHE_TIME)

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

    var m2mCached = m2mAuth(config)

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
