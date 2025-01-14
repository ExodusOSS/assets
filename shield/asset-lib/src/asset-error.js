export class AssetError extends Error {
  constructor(code, properties) {
    super(code)
    Object.defineProperty(this, 'name', { value: 'AssetError', enumerable: false })
    this.code = code
    this.properties = properties
  }
}

Object.defineProperty(AssetError, 'name', { value: 'AssetError' })
