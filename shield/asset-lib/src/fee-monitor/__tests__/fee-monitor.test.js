import FeeMonitor from '../fee-monitor.js'

const assetName = 'bitcoin'

describe('fee monitor', () => {
  it('start and update', async () => {
    const updateFee = jest.fn()
    const fee = {
      gasPrice: '1 BTC',
    }

    class TestFeeMonitor extends FeeMonitor {
      async fetchFee() {
        return fee
      }
    }

    const feeMonitor = new TestFeeMonitor({
      updateFee,
      interval: '1s',
      assetName,
    })
    expect(updateFee).not.toBeCalled()

    expect(feeMonitor.isStarted).toBeFalse()
    await feeMonitor.start()() // Note the double function. This is hangover from desktop's action based. To be clean up
    expect(feeMonitor.isStarted).toBeTrue()
    await feeMonitor.stop()
    expect(feeMonitor.isStarted).toBeFalse()
    expect(updateFee).toBeCalledWith(assetName, fee)
  })
})
