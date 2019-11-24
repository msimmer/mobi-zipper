module.exports = api => {
  api.cache(true)

  const opts = {}

  return {
    ignore: ['node_modules'],
    presets: [['@babel/env', opts]],
  }
}
