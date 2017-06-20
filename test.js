const path = require('path')
const mobi = require('./dist').default
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exec = require('child_process').exec

chai.should()
chai.use(chaiAsPromised)

describe('#checkForCalibre', () => {
  it('should verify that calibre\'s ebook-convert is installed', (done) => {
    exec('hash foo 2>/dev/null', (err) => {
      err.message.should.match(/Command failed:/)
      done()
    })
  })
})

describe('#conditionally', () => {
  it('should execute the callback if a condition is met', () => {
    mobi.conditionally(false).should.eventually.be.fulfilled
    mobi.conditionally(true, Promise.resolve(1)).should.eventually.equal(1)
  })
})
