module.exports = api => {
  api.cache(true)

  const opts = {
    targets: {
      node: '6',
    },
  }

  return {
    ignore: ['node_modules'],
    presets: [['@babel/env', opts]],
  }
}
