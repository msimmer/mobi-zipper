
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
      // flags: []
      flags: [
        '--mobi-file-type=both',
        '--disable-font-rescaling',
        '--no-inline-toc'
      ]
    }
  }

  _set(key, val) {
    this.options[key] = val
    return this.options[key]
  }

  _get(key) {
    return this.options[key]
  }

  report(err, stdout, stderr, reject) {
    if (err) { reject(err) }
    if (stderr !== '') { reject(new Error(stderr)) }
    if (stdout !== '') { console.log(stdout) } // eslint-disable-line no-console
    return
  }

  checkForCalibre() {
    const calibrepath = '/Applications/calibre.app/Contents/MacOS/ebook-convert'
    return new Promise((resolve, reject) =>
      exec('hash ebook-convert 2>/dev/null', (err1, stdout1, stderr1) => {
        if (err1) { reject(err1) }
        if (stdout1 !== '') { console.log(stdout1) } // eslint-disable-line no-console
        if (stderr1 === '' && !err1) {
          this._set('calibre', 'ebook-convert')
          resolve()
        }
        if (stderr1 !== '' && !err1) {
          exec(`[ -e "${calibrepath}" ] 2>/dev/null`, (err2, stdout2, stderr2) => {
            if (err2) { reject(err2) }
            if (stdout2 !== '') { console.log(stdout2) } // eslint-disable-line no-console
            if (stderr2 !== '') {
              reject(new Error({ message: [
                'calibre is required to convert this book.',
                'Download it here: https://calibre-ebook.com/'
              ].join(' ') }))
            }
            if (stderr2 === '' && !err2) {
              this._set('calibre', calibrepath)
              resolve()
            }
          })
        }
      })
    )
  }

  remove() {
    return [
      `mobis=\`ls -1 ${this._get('output')}/*.mobi 2>/dev/null | wc -l\`;`,
      `if [ $mobis != 0 ]; then rm ${this._get('output')}/*.mobi; fi`
    ].join(' ')
  }


  compile() {
    return [
      this._get('calibre'),
      this._get('input'),
      this._get('bookname'),
      this._get('flags').join(' '),
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

  conditionally(test, callback) {
    return new Promise((resolve/* , reject */) => {
      if (test) {
        return callback.then(resolve)
      } else {
        resolve()
      }
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
    this._set('modified', new Date().toISOString())
    this._set('bookname', `${this._get('modified')}.mobi`)
    this._set('bookpath', `"${path.resolve(this._get('output'), this._get('bookname'))}"`)
    return new Promise(resolve/* , reject */ =>
      this.checkForCalibre()
      .catch((err) => {
        if (err) {
          console.error(err) // eslint-disable-line no-console
          process.exit()
        }
      })
      .then(() => this.conditionally(this._get('clean'), this.run('remove', this._get('output'))))
      .then(() => this.run('compile', { dir: this._get('input') }))
      .catch(err => console.error(err)) // eslint-disable-line no-console
      .then(resolve)
    )
  }
}

const mobi = new Mobi()
export default mobi
