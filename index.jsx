
import path from 'path'
import { exec } from 'child_process'

class Mobi {
  constructor() {
    this.input = null
    this.output = null
    this.clean = null
    this.modified = null
    this.bookname = null
    this.bookpath = null
    this.calibre = null

    this._set = function _set(key, val) {
      this[key] = val
      return this[key]
    }

    this._get = function _get(key) {
      return this[key]
    }

    this.checkCalibre = function checkCalibre() {
      // return `hash ebook-convert 2>/dev/null || [ -e "${calibre}" ] 2>/dev/null`
      const calibrepath = '/Applications/calibre.app/Contents/MacOS/ebook-convert'
      return new Promise((resolve, reject) =>
        exec('hash ebook-convert 2>/dev/null', (err, stdout, stderr) => {
          if (err) { reject(err) }
          if (stdout !== '') { console.log(stdout) }
          if (stderr === '' && !err) {
            this._set('calibre', 'ebook-convert')
            resolve()
          }
          if (stderr !== '' && !err) {
            exec(`[ -e "${calibrepath}" ] 2>/dev/null`, (err, stdout, stderr) => {
              if (err) { reject(err) }
              if (stdout !== '') { console.log(stdout) }
              if (stderr !== '') {
                reject(new Error({message: 'calibre is required to convert this book. Download it here: https://calibre-ebook.com/'}))
              }
              if (stderr === '' && !err) {
                this._set('calibre', calibrepath)
                resolve()
              }
            })
          }
        })
      )
    }

    this.remove = function remove() {
      return 'mobis=`ls -1 *.mobi 2>/dev/null | wc -l`; if [ $mobis != 0 ]; then rm *.mobi; fi'
    }

    this.compile = function compile() {
      return [
        `zip -X0 ${this._get('bookpath')} ./mimetype`,
        `zip -X9Dr ${this._get('bookpath')} ./META-INF -x *.DS_Store`,
        `zip -X9Dr ${this._get('bookpath')} ./OPS -x *.DS_Store`
      ].join(' && ')
    }

    this.report = function report(err, stdout, stderr, reject) {
      if (err) { reject(err) }
      if (stderr !== '') { reject(new Error(stderr)) }
      if (stdout !== '') { console.log(stdout) }
    }

    this.run = function run(cmd, dir) {
      return new Promise((resolve, reject) => {
        exec(this[cmd](), { cwd: dir }, (err, stdout, stderr) => {
          this.report(err, stdout, stderr, reject)
          resolve()
        })
      })
    }

    this.conditionally = function conditionally(test, { cmd, dir }) {
      return new Promise((resolve /* , reject */) => {
        if (test) {
          this.run(cmd, dir).then(resolve)
        } else {
          resolve()
        }
      })
    }

    this.create = function create({ ...args }) {
      const { input, output, clean } = args
      this._set('input', input)
      this._set('output', output)
      this._set('clean', clean)
      this._set('modified', new Date().toISOString())
      this._set('bookname', `${this._get('modified')}.mobi`)
      this._set('bookpath', `"${path.resolve(__dirname, this._get('input'), '../', this._get('bookname'))}"`)
      return new Promise(resolve/* , reject */ =>
        this.checkCalibre()
        .catch(err => {
          if (err) {
             console.error(err)
             process.exit()
          }
        })
        .then(() => this.conditionally(clean, { cmd: 'remove', output }))
        .then(() => this.run('compile', input))
        .catch(err => console.error(err))
        .then(resolve)
      )
    }
  }
}

const mobi = new Mobi()
export default mobi
