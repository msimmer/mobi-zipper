const path = require('path')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const fs = require('fs-extra')
const zipper = require('..')

chai.should()
chai.use(chaiAsPromised)

const cwd = path.join(process.cwd(), 'tests')
const inputSuccess = path.join(cwd, 'book', 'OPS', 'content-success.opf')
const inputError = path.join(cwd, 'book', 'OPS', 'content-error.opf')
const output = path.join(cwd)

describe('mobi-zipper', () => {
  const origStdout = process.stdout.write
  const origStderr = process.stderr.write

  before(() => {
    process.stdout.write = () => {}
    process.stderr.write = () => {}
  })

  after(() => {
    process.stdout.write = origStdout
    process.stderr.write = origStderr
  })

  it('creates a mobi', () => {
    return zipper
      .create({ input: inputSuccess, output, clean: true })
      .then(() => {
        const mobis = fs
          .readdirSync(output)
          .filter(f => path.extname(f) === '.mobi')

        mobis.should.have.lengthOf(1)
        mobis[0].should.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z/)
      })
  })

  it('rejects errors', () => {
    return chai
      .expect(zipper.create({ input: inputError, output, clean: true }))
      .to.eventually.be.rejectedWith(Error)
  })
})
