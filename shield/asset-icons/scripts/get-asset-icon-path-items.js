const locakfile = require('@yarnpkg/lockfile')

const path = require('path')
const fs = require('fs')
const { relativeNodeModulesDir } = require('./common-params')

const jsYaml = require('js-yaml')

const parseYaml = jsYaml.load
const parseLock = locakfile.parse

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

const getLockFileObject = (yarnLockPath) => {
  const yarnLockFile = path.resolve(processDirectory, relativeNodeModulesDir, yarnLockPath)
  const content = fs.readFileSync(yarnLockFile, 'utf8')
  try {
    // old yarn
    return parseLock(content).object
  } catch {
    // newer yarn
    return parseYaml(content)
  }
}

const getAssetMetaPackagesFromYarnLock = (yarnLockPath) => {
  const yarnLockContent = getLockFileObject(yarnLockPath)
  const lines = Object.keys(yarnLockContent)
  const deps = lines.map((name) => {
    const firstDep = name.slice(0, name.indexOf(','))
    return firstDep.slice(0, firstDep.lastIndexOf('@'))
  })
  const duplicated = deps.filter((name) => {
    return name.match(/^@exodus\/[^/]+-meta$/)
  })
  return [...new Set(duplicated)].sort()
}

const getImportPath = ({ packagePath, packageName, legacy = false }) => {
  if (legacy) {
    return fs.existsSync(`${packagePath}/lib/index.js`)
      ? `${packagePath}/lib/index.js`
      : `${packagePath}/src/index.js`
  }

  return require.resolve(packageName)
}

const _generate = async (folder, { packageName, legacy = false }) => {
  try {
    const packagePath = legacy
      ? path.resolve(processDirectory, relativeNodeModulesDir, packageName)
      : path.dirname(require.resolve(`${packageName}/package.json`))

    assertNotGlobalFolder(packagePath)

    const { default: assetsList } = await import(
      getImportPath({ packagePath, packageName, legacy })
    )

    if (!Array.isArray(assetsList) || assetsList.length === 0) {
      return []
    }

    const dir = path.join(packagePath, folder)
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
    const items = []

    files.forEach((filename) => {
      if (filename.startsWith('.')) return
      const assetName = filename.split('.svg')[0].replace('-sign', '')
      items.push([assetName, `${packageName}/${folder}`, filename])
    })

    return items
  } catch (e) {
    console.error(e)
    return []
  }
}

const getAssetIconPathItems = async (
  { folderPostfix, legacy, yarnLockPath } = Object.create(null)
) => {
  if (!yarnLockPath) {
    throw new Error('yarnLockPath is required to resolve icons!')
  }

  const assetMetaPackages = getAssetMetaPackagesFromYarnLock(yarnLockPath)

  const promises = assetMetaPackages.map((packageName) => {
    const folderPath = `assets/svg${folderPostfix || ''}`
    return _generate(folderPath, { packageName, legacy })
  })
  const results = await Promise.all(promises)
  return results.flat()
}

module.exports = getAssetIconPathItems
