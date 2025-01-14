export default class BaseFeeData {
  update(config = {}) {
    throw new Error('Not Implemented')
  }

  toJSON() {
    throw new Error('Not Implemented')
  }
}
