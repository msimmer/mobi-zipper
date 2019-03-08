
# mobi-zipper

[![NPM version](https://badge.fury.io/js/mobi-zipper.svg)](https://badge.fury.io/js/mobi-zipper)
[![Code Climate](https://codeclimate.com/github/msimmer/mobi-zipper/badges/gpa.svg)](https://codeclimate.com/github/msimmer/mobi-zipper)
[![CircleCI](https://circleci.com/gh/msimmer/mobi-zipper.svg?style=svg)](https://circleci.com/gh/msimmer/mobi-zipper)

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
  input: path.join(__dirname, './epub/OPS/content.opf'),
  output: __dirname,
  clean: true // Removes existing .mobis in the output dir
}

zipper.create(options).catch(err => console.error(err))
```
