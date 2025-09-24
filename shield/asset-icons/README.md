## Asset-icons

Package exports functions to generate asset-icons.

The functions are assumed to be used within platform's scripts and rely on `assets-base` package to get list of `-meta` packages to get svg from.

### Installation

`yarn add -D @exodus/asset-icons`

### Usage

`generate.web.js` - exports function to build a file exporting `assetIcons` dict in the form of `{[assetName]: RawSvgReference}`. Used in web environments.

`get-asset-icon-path-items.js` - exports function returning array of paths to svg files from `-meta` packages. May be used as an input for svgr.

Both scripts use 3 positional process parameters:

`relativeOutputDir` - where to put generated files

`relativeNodeModulesDir` - path to `noode_modules` containing `assets-base` package

`yarnLockPath` - path to the `yarn.lock` file relative to `node_modules`

Example of the `asset-icons.js` script in web platform:

```js
const generate = require('@exodus/asset-icons/scripts/generate.web')

generate()
generate({ yarnLockPath: '../yarn.lock' }) // to generate based on the yarn.lock dependencie rather than assets-base
```

And its usage:

```bash
#!/bin/sh

NODE_MODULES_DIR="./src/node_modules"
SCRIPT_PATH="./scripts/asset-icons.js"
OUT_DIR="./src/_local_modules/asset-icons"
OUT_DIR_FILES="${OUT_DIR}/*.js"

node "${SCRIPT_PATH}" "${OUT_DIR}" "${NODE_MODULES_DIR}" &&
 prettier --write "${OUT_DIR_FILES}" &&
  eslint "${OUT_DIR_FILES}" --fix
```
