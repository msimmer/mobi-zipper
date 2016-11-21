
# mobi-zipper

Compiles a Mobi file using [calibre](https://calibre-ebook.com/)’s `ebook-convert`.  Returns a promise object.

## Install

```
$ npm i -S mobi-zipper
```

## Usage

```js
import path from 'path'
import zipper from 'mobi-zipper'

const options = {
  input: path.join(__dirname, './book-dir'),
  output: __dirname,
  clean: true // Removes existing .mobis in the output dir
}

zipper.create(options).catch(err => console.error(err))
```
