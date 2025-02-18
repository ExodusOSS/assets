module.exports = {
  extends: '../../.eslintrc.js',
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018,
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
  ],
}
