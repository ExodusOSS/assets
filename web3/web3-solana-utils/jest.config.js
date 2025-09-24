import baseConfig from '../../jest.config.cjs'

const config = {
  ...baseConfig,
  preset: 'ts-jest/presets/js-with-ts-esm',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/lib'],
}

export default config
