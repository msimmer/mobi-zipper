const path = require('path')
const { exec } = require('child_process')
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
      const cwd = path.dirname(this.settings.input)
      const flags = this.settings.flags.join(' ')
      const cmd = [
        this.ebookConvert,
        this.settings.input,
        this.bookpath,
        flags,
      ].join(' ')

      exec(cmd, { cwd }, (err, stdout, stderr) => {
        if (err) reject(err)
        if (stderr !== '') reject(new Error(stderr))
        if (stdout !== '') console.log(stdout)
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
    this.bookpath = `"${path.resolve(this.settings.output, this.bookname)}"`

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
