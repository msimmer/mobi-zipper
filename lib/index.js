/* eslint-disable no-console, no-multi-spaces */
import path from 'path'
import { exec } from 'child_process'

class Mobi {
  constructor() {
    this.options = {
      input: null,
      output: null,
      clean: true,
      modified: null,
      bookname: null,
      bookpath: null,
      calibre: null,
      flags: [
        '--mobi-file-type=both',
        '--disable-font-rescaling',
        '--no-inline-toc',
      ],
    }
  }


  get calibre()   { return this._calibre  }
  get modified()  { return this._modified }
  get bookname()  { return this._bookname }
  get bookpath()  { return this._bookpath }

  set calibre(val)   { this._calibre = val  }
  set modified(val)  { this._modified = val }
  set bookname(val)  { this._bookname = val }
  set bookpath(val)  { this._bookpath = val }

  report(err, stdout, stderr, reject) { // eslint-disable-line class-methods-use-this
    if (err) { reject(err) }
    if (stderr !== '') { reject(new Error(stderr)) }
    if (stdout !== '') { console.log(stdout) }
  }

  conditionally(test, callback) { // eslint-disable-line class-methods-use-this
    return new Promise((resolve) => {
      if (test) {
        callback.then(resolve)
      } else {
        resolve()
      }
    })
  }

  checkForCalibre() {
    const calibrepath = '/Applications/calibre.app/Contents/MacOS/ebook-convert'
    return new Promise((resolve, reject) =>
      exec('hash ebook-convert 2>/dev/null', (err1, stdout1, stderr1) => {
        if (err1) { reject(err1) }
        if (stdout1 !== '') { console.log(stdout1) }
        if (stderr1 === '' && !err1) {
          this.calibre = 'ebook-convert'
          resolve()
        }
        if (stderr1 !== '' && !err1) {
          exec(`[ -e "${calibrepath}" ] 2>/dev/null`, (err2, stdout2, stderr2) => {
            if (err2) { reject(err2) }
            if (stdout2 !== '') { console.log(stdout2) }
            if (stderr2 !== '') {
              reject(new Error({ message: [
                'calibre is required to convert this book.',
                'Download it here: https://calibre-ebook.com/',
              ].join(' ') }))
            }
            if (stderr2 === '' && !err2) {
              this.calibre = calibrepath
              resolve()
            }
          })
        }
      })
    )
  }

  remove() {
    return [
      `mobis=\`ls -1 ${this.output}/*.mobi 2>/dev/null | wc -l\`;`,
      `if [ $mobis != 0 ]; then rm ${this.output}/*.mobi; fi`,
    ].join(' ')
  }


  compile() {
    return [
      this.calibre,
      this.input,
      this.bookpath,
      this.flags.join(' '),
    ].join(' ')
  }

  run(cmd, dir) {
    return new Promise((resolve, reject) => {
      exec(this[cmd](), { cwd: dir }, (err, stdout, stderr) => {
        this.report(err, stdout, stderr, reject)
        resolve()
      })
    })
  }

  create({ ...args }) {
    Object.assign(this.options, args)
    const required = ['input', 'output']

    required.forEach((_) => {
      if (!this.options[_] || !{}.hasOwnProperty.call(this.options, _)) {
        throw new Error(`Missing required argument: \`${_}\``)
      }
    })

    if (!path.extname(this.input)) {
      throw new Error('Input file must have an extension.')
    }

    this.modified = new Date().toISOString().replace(/:/g, '-')
    this.bookname = `${this.modified}.mobi`
    this.bookpath = `"${path.resolve(this.output, this.bookname)}"`


    return new Promise(resolve =>
      this.checkForCalibre()
      .then(() => this.conditionally(this.clean, this.run('remove', this.output)))
      .then(() => this.run('compile', { dir: this.input }))
      .catch((err) => {
        console.error(err)
        process.exit(1)
      })
      .then(resolve)
    )
  }
}

const mobi = new Mobi()
export default mobi
