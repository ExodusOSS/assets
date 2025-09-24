// eslint-disable-next-line @exodus/import/no-extraneous-dependencies
import { validator } from '@exodus/schemasafe'
import fs from 'fs'
import path from 'path'
// eslint-disable-next-line @exodus/import/no-extraneous-dependencies
import prettier from 'prettier'

import schema from './src/schema.js'

const outputDir = 'lib'
const outputFilename = 'index.js'
const outputFilePath = path.join(outputDir, outputFilename)

async function format(source) {
  const configOptions = await prettier.resolveConfig(path.resolve('.'))
  const options = {
    ...configOptions,
    parser: 'typescript',
  }
  return prettier.format(source, options)
}

/**
 * Generates a validation function that receives an object and returns the same object or raises an exception if it does not pass the validation.
 */
function buildValidateFunction(validator) {
  return `
    export function validateCustomToken(value) {
      const validate = ${validator.toModule()}

      const isValid = validate(value)
      if (!isValid) {
        const { keywordLocation, instanceLocation } = validate.errors[0]
        const keyword = keywordLocation.slice(
          keywordLocation.lastIndexOf('/') + 1,
        )
        const message = \`JSON validation failed for \${keyword} at \${instanceLocation}\`
        throw new Error(message)
      }

      return value
    }

    export function isValidCustomToken(value) {
      const validate = ${validator.toModule()}
      return !!validate(value)
    }
  `
}

async function compileValidator() {
  const validateCustomToken = validator(schema, {
    mode: 'strong',
    includeErrors: true,
    removeAdditional: true,
    extraFormats: true,
    formats: {
      'any-string': (value) => typeof value === 'string',
    },
  })

  const output = `
    ${buildValidateFunction(validateCustomToken)}
  `
  return format(output)
}

async function build() {
  const output = await compileValidator()
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
  fs.writeFileSync(outputFilePath, output)
}

build().catch((err) => {
  console.log(err)
})
