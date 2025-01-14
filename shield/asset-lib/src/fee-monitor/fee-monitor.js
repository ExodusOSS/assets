import { Timer } from '@exodus/timer'
import assert from 'minimalistic-assert'
import ms from 'ms'

/**
 * class HelloMonitor extends FeeMonitor {
 *   constructor({ updateFee, interval = '1m', assetName = 'ethereum' }) {
 *     super({ updateFee, interval, assetName })
 *   }
 *
 *   async fetchFee() {
 *     return {
 *       gasPrice: gasPrice + ' Gwei'
 *     }
 *   }
 */

export default class FeeMonitor {
  /**
   * @param updateFee callback to store the new fee data
   * @param interval the ms lib string interval. eg. 60s . Undefined means the timer won't be started, monitor would only fetch on initialization (start()) or on demand (update())
   * @param assetName the base asset name
   */
  constructor({ updateFee, interval, assetName }) {
    assert(updateFee, 'updateFee is required')
    assert(assetName, 'assetName is required')
    this.updateFee = updateFee
    this.timer = interval ? new Timer(ms(interval)) : undefined
    this.assetName = assetName
    this.isStarted = false
  }

  async fetchFee() {
    throw new Error('Not Implemented')
  }

  _start = () => {
    // new start once fees module stops using await and ()()
    // to be renamed
    if (this.isStarted) {
      return
    }

    this.isStarted = true
    return this.timer
      ? this.timer.start(() => {
          return this.tick()
        })
      : this.tick()
  }

  start = () => {
    this._start()
    return async () => {} // dummy function for the ()() migration))
  }

  update = () => {
    return async () => {
      if (!this.isStarted) {
        return
      }

      return this.tick()
    }
  }

  tick = async () => {
    try {
      const feeConfig = await this.fetchFee()
      await this.updateFee(this.assetName, feeConfig)
    } catch (err) {
      console.warn(`Fee monitor tick error for ${this.assetName}`, err.message, err)
    }
  }

  stop = async () => {
    if (!this.isStarted) {
      return
    }

    this.isStarted = false
    await this.timer?.stop()
  }
}
