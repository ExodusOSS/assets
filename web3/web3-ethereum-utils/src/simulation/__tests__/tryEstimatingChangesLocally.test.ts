import { connectAssets } from '@exodus/assets'
import assetsList from '@exodus/ethereum-meta'
import lodash from 'lodash'
const mockEstimateSimpleTransfer = jest.fn()

jest.mock('../estimateSimpleTransfer.js', () => {
  const originalModule = jest.requireActual('../estimateSimpleTransfer.js')

  return {
    __esModule: true,
    ...originalModule,
    estimateSimpleTransfer: mockEstimateSimpleTransfer,
  }
})

const { NotSimpleTransferError } = await import('../estimateSimpleTransfer.js')
const { tryEstimatingChangesLocally } = await import(
  '../tryEstimatingChangesLocally.js'
)

const { keyBy } = lodash

const assets = connectAssets(keyBy(assetsList, (asset) => asset.name))

const transferValue = assets.ethereum.currency.baseUnit(100)

describe('tryEstimatingChangesLocally', () => {
  it('mutates the supplied "simulationResult" object if transaction is a simple transfer', () => {
    mockEstimateSimpleTransfer.mockImplementation(() => transferValue)

    const simulationResult = {
      balanceChanges: {
        willSend: [],
      },
    }
    // Not passing any params besides as the function is mocked above.
    const result = tryEstimatingChangesLocally({
      transaction: {
        from: '0x2Ef12A38928697c854d0C2ADd48225ABfB1AcC06',
        to: '0x67A2F40efFE3F1C05Ebf8699A8E45d9829822a85',
      },
      simulationResult,
    })

    expect(simulationResult.balanceChanges.willSend[0]).toEqual({
      balance: transferValue,
    })
    expect(result).toEqual(true)
  })

  it('does not mutate the supplied "simulationResult" object if "estimateSimpleTransfer" throws an error', () => {
    mockEstimateSimpleTransfer.mockImplementation(() => {
      throw new NotSimpleTransferError('')
    })

    const simulationResult = {
      balanceChanges: {
        willSend: [],
      },
    }
    // Not passing any params besides as the function is mocked above.
    const result = tryEstimatingChangesLocally({
      simulationResult,
    })

    expect(simulationResult.balanceChanges.willSend).toEqual([])
    expect(result).toEqual(false)
  })
})
