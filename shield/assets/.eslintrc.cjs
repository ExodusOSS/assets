module.exports = {
  extends: '../../.eslintrc.js',
  rules: {
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
        ignore: [
          'usdcoin_ftx.js', // probably too risky to rename this
        ],
      },
    ],
  },
}
