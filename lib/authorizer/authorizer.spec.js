'use strict'

var chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  chaiAsPromised = require("chai-as-promised")

chai.use(chaiAsPromised)

var inst = require('./')
describe('Authorizer', () => {

  it('should be initialized', () => {
    inst.should.exist
  })

  describe('policy evaluator promise', () => {
    it('should be rejected if policy is not defined', (done) => {
      inst.can(null, 'undefined').should.be.rejected.notify(done)
    })

    it('should be resolved to true with boolean true policy', (done) => {
      inst.setPolicy('test1', true)
      inst.can(null, 'test1').should.be.fulfilled.notify(done)
    })

    it('should be rejected with boolean \'false\' policy', (done) => {
      inst.setPolicy('test1', false)
      inst.can(null, 'test1').should.be.rejected.notify(done)
    })

    it('should be rejected with policy returning a rejected promise', (done) => {
      let err = new Error('test rejection')
      inst.setPolicy('test', () => Promise.reject(err, 'rejected'))
      inst.can(null, 'test').should.be.rejected.notify(done)
    })
  })
})
