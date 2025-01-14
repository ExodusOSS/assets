const [
  relativeOutputDir = './scripts',
  relativeNodeModulesDir = './node_modules', // the one with `@exodus/assets-base` module
] = process.argv.slice(2)

module.exports = {
  relativeOutputDir,
  relativeNodeModulesDir,
}
