import path from 'path'
import { exec } from 'child_process'
import exists from 'command-exists'
import fs from 'fs-extra'

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


  get modified() { return this._modified }
  get bookname() { return this._bookname }
  get bookpath() { return this._bookpath }
  get options() { return this._options }
  get settings() { return this._settings }

  set modified(val) { this._modified = val }
  set bookname(val) { this._bookname = val }
  set bookpath(val) { this._bookpath = val }
  set options(val) { this._options = val }
  set settings(val) { this._settings = val }


  checkForCalibre() {
    return new Promise((resolve, reject) => {
      exists('ebook-convert', (err, ok) => {
        if (err || !ok) {
          const error = new Error('Error: calibre\'s ebook-convert must be installed. Download calibre here: https://calibre-ebook.com/')
          reject(error)
        }
        resolve()
      })
    })
  }

  removeExistingMobis() {
    const promises = []
    return new Promise(resolve => {
      if (this.settings.clean !== true) { resolve() }

      fs.readdir(this.settings.output, (err, files) => {
        if (err) { throw err }
        const mobis = files.filter(f => path.extname(f) === '.mobi')
        mobis.forEach(mobi => {
          promises.push(fs.remove(path.join(this.settings.output, mobi)))
        })

        Promise.all(promises).then(resolve)
      })
    })
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
        if (err) { reject(err) }
        if (stderr !== '') { reject(new Error(stderr)) }
        if (stdout !== '') { console.log(stdout) }
        resolve()
      })
    })
  }

  create({ ...args }) {
    this.settings = { ...this.options, ...args }
    const required = ['input', 'output']


    required.forEach((_) => {
      if (!this.settings[_] || !{}.hasOwnProperty.call(this.settings, _)) {
        throw new Error(`Missing required argument: \`${_}\``)
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
export default zipper
