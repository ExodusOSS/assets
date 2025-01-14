const path = require('path')
const fs = require('fs')
const { relativeNodeModulesDir } = require('./common-params')

const processDirectory = process.cwd()

const homeDir = require('os').homedir()
const nodePrefixDir =
  process.platform === 'win32'
    ? path.resolve(process.execPath, '..')
    : path.resolve(process.execPath, '..', '..')

const globalPaths = [
  path.resolve(homeDir, '.node_modules'),
  path.resolve(homeDir, '.node_libraries'),
  path.resolve(nodePrefixDir, 'lib', 'node'),
  path.resolve(nodePrefixDir, 'lib', 'node_modules'),
]

if (process.env.NODE_PATH) {
  globalPaths.unshift(...process.env.NODE_PATH.split(path.delimiter).filter(Boolean))
}

const assertNotGlobalFolder = (packagePath) => {
  // refs: https://nodejs.org/api/modules.html#loading-from-the-global-folders
  if (globalPaths.some((path) => packagePath.startsWith(path))) {
    throw new Error(`Importing package from global folder (${packagePath}) is not allowed`)
  }
}

const getAssetMetaPackages = (legacy = false) => {
  const packageJsonPath = legacy
    ? path.resolve(processDirectory, relativeNodeModulesDir, '@exodus/assets-base/package.json')
    : require.resolve('@exodus/assets-base/package.json')

  assertNotGlobalFolder(path.dirname(packageJsonPath))

  const json = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  return Object.keys(json.dependencies).filter((name) => name.match(/^@exodus\/[^/]+-meta$/))
}

const getImportPath = ({ packagePath, packageName, legacy = false }) => {
  if (legacy) {
    return fs.existsSync(`${packagePath}/lib/index.js`)
      ? `${packagePath}/lib/index.js`
      : `${packagePath}/src/index.js`
  }

  return require.resolve(packageName)
}

const _generate = async (folder, { packageName, onlyBase, legacy = false }) => {
  try {
    const packagePath = legacy
      ? path.resolve(processDirectory, relativeNodeModulesDir, packageName)
      : path.dirname(require.resolve(`${packageName}/package.json`))

    assertNotGlobalFolder(packagePath)

    const { asset } = await import(getImportPath({ packagePath, packageName, legacy }))
    const { baseAssetName } = asset
    const dir = path.join(packagePath, folder)
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
    const items = []

    files.forEach((filename) => {
      const assetName = filename.split('.svg')[0].replace('-sign', '')
      if (onlyBase) {
        assetName === baseAssetName && items.push([assetName, `${packageName}/${folder}`, filename])
      } else {
        items.push([assetName, `${packageName}/${folder}`, filename])
      }
    })

    return items
  } catch (e) {
    console.error(e)
    return []
  }
}

const getAssetIconPathItems = async ({ folderPostfix, onlyBase, legacy } = Object.create(null)) => {
  const assetMetaPackages = getAssetMetaPackages(legacy)
  const promises = assetMetaPackages.map((packageName) => {
    const folderPath = `assets/svg${folderPostfix || ''}`
    return _generate(folderPath, { packageName, onlyBase, legacy })
  })
  const results = await Promise.all(promises)
  return results.flat()
}

module.exports = getAssetIconPathItems
