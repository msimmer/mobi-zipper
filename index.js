const path = require('path')
const { spawn } = require('child_process')
const exists = require('command-exists')
const fs = require('fs-extra')

class Zipper {
  constructor() {
    this.settings = {}
    this.ebookConvert = 'ebook-convert'
    this.options = {
      input: null,
      output: null,
      clean: true,
      flags: [
        '--mobi-file-type=both',
        '--disable-font-rescaling',
        '--no-inline-toc',
      ],
    }
  }

  checkForCalibre() {
    return new Promise((resolve, reject) => {
      exists('ebook-convert', (err, ok) => {
        if (err || !ok) {
          reject(
            new Error(
              "Error: calibre's ebook-convert must be installed. Download calibre here: https://calibre-ebook.com/"
            )
          )
        }
        resolve()
      })
    })
  }

  removeExistingMobis() {
    if (this.settings.clean !== true) return Promise.resolve()

    const files = fs.readdirSync(this.settings.output)
    const mobis = files.filter(file => path.extname(file) === '.mobi')
    const promises = mobis.map(mobi =>
      fs.remove(path.join(this.settings.output, mobi))
    )

    return Promise.all(promises)
  }

  compileMobi() {
    return new Promise((resolve, reject) => {
      const options = { cwd: path.dirname(this.settings.input) }
      const cmd = this.ebookConvert
      const args = [this.settings.input, this.bookpath, ...this.settings.flags]

      const proc = spawn(cmd, args, options)
      let ebookConvertError = 0

      proc.stdout.on('data', data => process.stdout.write(data.toString()))
      proc.stderr.on('data', data => {
        ebookConvertError = 1
        process.stderr.write(data.toString())
      })

      proc.on('close', code => {
        if (code === 1) return reject('Process exited with code 1')
        if (ebookConvertError === 1) {
          return reject(new Error('There was an error creating the mobi'))
        }
        resolve()
      })
    })
  }

  create(args = {}) {
    this.settings = Object.assign({}, this.options, args)
    const required = ['input', 'output']

    required.forEach(arg => {
      if (!this.settings[arg] || !{}.hasOwnProperty.call(this.settings, arg)) {
        throw new Error(`Missing required argument: \`${arg}\``)
      }
    })

    if (!path.extname(this.settings.input)) {
      throw new Error('Input file must have an extension.')
    }

    this.modified = new Date().toISOString().replace(/:/g, '-')
    this.bookname = `${this.modified}.mobi`
    this.bookpath = `${path.resolve(this.settings.output, this.bookname)}`

    return new Promise((resolve, reject) =>
      this.removeExistingMobis()
        .then(() => this.checkForCalibre())
        .then(() => this.compileMobi())
        .catch(err => reject(err))
        .then(resolve)
    )
  }
}

const zipper = new Zipper()
module.exports = zipper
