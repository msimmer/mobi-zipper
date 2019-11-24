module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'prettier/standard'],
  plugins: ['babel', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
  globals: {
    after: true,
    before: true,
    describe: true,
    it: true,
  },
}
