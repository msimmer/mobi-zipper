const path = require('path')
const zipper = require('./dist').default
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const fs = require('fs-extra')

chai.should()
chai.use(chaiAsPromised)


const cwd = process.cwd()
const input = path.join(cwd, 'book', 'OPS', 'content.opf')
const output = path.join(cwd)

describe('mobi-zipper', () => {
  it('creates a mobi', (done) => {
    zipper.create({ input, output }).then(() => {
      fs.readdirSync(output).filter(_ => path.extname(_) === '.mobi').should.have.lengthOf(1)
      done()
    })
  })
})
