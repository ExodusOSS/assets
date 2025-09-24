const path = require('node:path')
module.exports = {
  extends: '../../.eslintrc.js',
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    'unicorn/prefer-spread': 'off',
  },
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: path.join(__dirname, 'tsconfig.lint.json'),
      },
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      rules: {
        'linebreak-style': ['error', 'unix'],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
}
