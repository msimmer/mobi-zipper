const path = require('path')
const zipper = require('..')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const fs = require('fs-extra')

chai.should()
chai.use(chaiAsPromised)

const cwd = path.join(process.cwd(), 'tests')
const input = path.join(cwd, 'book', 'OPS', 'content.opf')
const output = path.join(cwd)

describe('mobi-zipper', () => {
  it('creates a mobi', done => {
    zipper.create({ input, output, clean: true }).then(() => {
      const mobis = fs
        .readdirSync(output)
        .filter(f => path.extname(f) === '.mobi')

      mobis.should.have.lengthOf(1)
      mobis[0].should.match(/\d{4}\-\d{2}\-\d{2}T\d{2}\-\d{2}\-\d{2}\.\d{3}Z/)

      done()
    })
  })
})
