import { asset as baseAsset } from '@exodus/bitcoin-meta'
import { fetch } from '@exodus/fetch'

import { createSimulateTransactions } from '../createSimulateTransactions.js'
import fixtures from '../fixtures'
import magicEdenBuyOrdinalsFixtures from '../fixtures/magic-eden-buy-ordinals.js'
import magicEdenSellOrdinalsFixtures from '../fixtures/magic-eden-sell-ordinals.js'
import magnifierTxs from '../fixtures/magnifier-txs.js'
import runesFixtures from '../fixtures/runes.js'

const runAsIntegrationTests = false

function simplifyForAssertion(obj) {
  // If the value is a primitive type, convert it to a string directly.
  if (obj === null) {
    return obj
  }
  if (obj.toBaseString) {
    return obj.toBaseString({ unit: true })
  }
  if (typeof obj !== 'object') {
    return obj
  }

  // If the value is an Array, convert each element.
  if (Array.isArray(obj)) {
    return obj.map(simplifyForAssertion)
  }

  // If the value is an object, convert each value in the object.
  const convertedObj = {}
  for (const [key, value] of Object.entries(obj)) {
    convertedObj[key] = simplifyForAssertion(value)
  }
  return convertedObj
}

const createSimpleInsightClient = (baseUrl) => {
  const fetchTxObject = async (txId) => {
    const url = `${baseUrl}/fulltx?${new URLSearchParams({ hash: txId })}`
    const response = await fetch(url)

    if (response.status === 404) {
      return null
    }
    const object = await response.json()
    if (!object || !Object.keys(object).length) {
      return null
    }
    return object
  }
  return { fetchTxObject }
}

const createMockInsightClient = () => {
  const fetchTxObject = async (txId) => {
    return magnifierTxs[txId]
  }
  return { fetchTxObject }
}

const factoryDependencies = {
  logger: {
    error: jest.fn(),
  },
}
const asset = {
  ...baseAsset,
  insightClient: runAsIntegrationTests
    ? createSimpleInsightClient(
        'https://magiceden-bitcoin-p.a.exodus.io/insight',
      )
    : createMockInsightClient(),
}

describe('createSimulateTransactions', () => {
  it('should return a function', () => {
    const simulateTransactions = createSimulateTransactions(factoryDependencies)

    expect(typeof simulateTransactions).toBe('function')
  })

  it('should gracefully handle a missing "logger"', () => {
    const simulateTransactions = createSimulateTransactions()

    expect(typeof simulateTransactions).toBe('function')
  })

  describe('simulateTransactions', () => {
    let simulateTransactions

    beforeEach(() => {
      simulateTransactions = createSimulateTransactions(factoryDependencies)
    })

    it('estimates changes for a TX with a Witness UTXO input', async () => {
      const address = 'bc1qlrh635rpvps06d9klakf7k3lq4tlnd25e53pez'
      const walletAddresses = {
        [address]: true,
      }
      const { balanceChanges, advancedDetails, displayDetails } =
        await simulateTransactions({
          asset,
          transactions: [fixtures['witness-utxo'].psbtBase64],
          indexToAddressRecord: {
            0: { address },
          },
          walletAddresses,
        })
      expect(balanceChanges.willPayFee[0].balance.toNumber()).toEqual(
        fixtures['witness-utxo'].fee,
      )
      expect(balanceChanges.willSend[0].balance.toNumber()).toEqual(
        fixtures['witness-utxo'].sending,
      )
      expect(advancedDetails.inputs[0].address).toEqual(address)
      expect(advancedDetails.inputs[0].txID).toEqual(
        '875bb40ad587fcb03c912ac2ca5f7113fb4e118a130a09646f2eb1db30b77d76',
      )
      for (const output of advancedDetails.outputs) {
        expect(output.isWalletAddress).toBeTruthy()
        expect(output.address).toEqual(address)
      }
      expect(displayDetails.warnings).toEqual([])
    })

    it('estimates changes for a TX with a Witness and non-Witness UTXO inputs', async () => {
      const address = 'bc1qmpwzkuwsqc9snjvgdt4czhjsnywa5yjdgwyw6k'
      const walletAddresses = {
        [address]: true,
      }
      const { advancedDetails, balanceChanges } = await simulateTransactions({
        asset,
        transactions: [fixtures['non-witness-utxo'].psbtBase64],
        indexToAddressRecord: {
          0: { address: 'bc1qmpwzkuwsqc9snjvgdt4czhjsnywa5yjdgwyw6k' },
          1: {
            address: 'bc1qmpwzkuwsqc9snjvgdt4czhjsnywa5yjdgwyw6k',
            sigHash: 130, // Simulation should warn about this unsafe sig hash.
          },
        },
        walletAddresses,
      })
      expect(balanceChanges.willPayFee[0].balance.toNumber()).toEqual(
        fixtures['non-witness-utxo'].fee,
      )
      expect(balanceChanges.willSend[0].balance.toNumber()).toEqual(
        fixtures['non-witness-utxo'].sending,
      )
      for (const [index, input] of advancedDetails.inputs.entries()) {
        expect(input.txID).toEqual(
          fixtures['non-witness-utxo'][`txID:${index}`],
        )
        expect(input.address).toEqual(address)
      }
      expect(advancedDetails.outputs[0].address).toEqual(address)
      expect(advancedDetails.outputs[0].isWalletAddress).toBeTruthy()
      expect(advancedDetails.outputs[1].isWalletAddress).toBeFalsy()
    })

    it('warns if unsafe sighash used', async () => {
      const address = 'bc1qmpwzkuwsqc9snjvgdt4czhjsnywa5yjdgwyw6k'
      const walletAddresses = {
        [address]: true,
      }
      const { displayDetails } = await simulateTransactions({
        asset,
        transactions: [fixtures['non-witness-utxo'].psbtBase64],
        indexToAddressRecord: {
          0: { address: 'bc1qmpwzkuwsqc9snjvgdt4czhjsnywa5yjdgwyw6k' },
          1: {
            address: 'bc1qmpwzkuwsqc9snjvgdt4czhjsnywa5yjdgwyw6k',
            sigHash: 130, // Simulation should warn about this unsafe sig hash.
          },
        },
        walletAddresses,
      })

      expect(displayDetails.warnings).toEqual([
        'Dangerous sighash detected - SIGHASH_NONE',
      ])
    })

    it('estimates changes for a TX that receives more than sending (Ordinals listing)', async () => {
      const address = '3FxphuTDQsJoxQySrkYsA7qEeSGoUbZHC6'
      const taprootAddress =
        'bc1pq86ru36tv2d8mpeeag0nxc4q08zly0wdgummvt8nncepprk6sqwq30p58y'
      const walletAddresses = {
        [address]: true,
      }
      const { advancedDetails, balanceChanges, displayDetails } =
        await simulateTransactions({
          asset,
          transactions: [fixtures['non-witness-utxo-2'].psbtBase64],
          indexToAddressRecord: {
            0: { address: taprootAddress },
          },
          walletAddresses,
        })
      expect(balanceChanges.willPayFee[0].balance.toNumber()).toEqual(
        fixtures['non-witness-utxo-2'].fee,
      )
      expect(balanceChanges.willReceive[0].balance.toNumber()).toEqual(
        fixtures['non-witness-utxo-2'].receiving,
      )
      for (const [index, input] of advancedDetails.inputs.entries()) {
        expect(input.txID).toEqual(
          fixtures['non-witness-utxo-2'][`txID:${index}`],
        )
        expect(input.address).toEqual(taprootAddress)
      }
      expect(advancedDetails.outputs[0].address).toEqual(address)
      expect(advancedDetails.outputs[0].isWalletAddress).toBeTruthy()
      expect(displayDetails.warnings).toEqual([])
    })

    it('estimates changes for a TX that buys an Ordinal on ME', async () => {
      const { transactions, indexToAddressRecord, walletAddresses } =
        magicEdenBuyOrdinalsFixtures['buy-1-ordinal']

      const { balanceChanges, displayDetails } = await simulateTransactions({
        asset,
        transactions,
        indexToAddressRecord,
        walletAddresses,
      })

      expect(simplifyForAssertion(balanceChanges)).toEqual({
        willApprove: [],
        willPayFee: [
          {
            balance: '31928 satoshis',
          },
        ],
        willReceive: [
          {
            balance: '1 base',
            nft: {
              compositeId:
                '215b8f9462cdda5622b1a4161c12fd7a23f0427b2f8f6e7379ed0d3c9fd560c8i0',
              id: 'bitcoin:215b8f9462cdda5622b1a4161c12fd7a23f0427b2f8f6e7379ed0d3c9fd560c8i0',
            },
          },
        ],
        willSend: [
          {
            balance: '41596 satoshis',
          },
        ],
      })
      expect(displayDetails.warnings).toEqual([])
    })

    it('estimates changes for a TX that buys two Ordinals on ME', async () => {
      const { transactions, indexToAddressRecord, walletAddresses } =
        magicEdenBuyOrdinalsFixtures['buy-2-ordinals']

      const { balanceChanges, displayDetails } = await simulateTransactions({
        asset,
        transactions,
        indexToAddressRecord,
        walletAddresses,
      })
      expect(simplifyForAssertion(balanceChanges)).toEqual({
        willApprove: [],
        willPayFee: [
          {
            balance: '25422 satoshis',
          },
        ],
        willReceive: [
          {
            balance: '1 base',
            nft: {
              compositeId:
                '76c2923639dee6c02ddb37e0e6fd983910785d01fb900e0107c447184ecd1bcei0',
              id: 'bitcoin:76c2923639dee6c02ddb37e0e6fd983910785d01fb900e0107c447184ecd1bcei0',
            },
          },
          {
            balance: '1 base',
            nft: {
              compositeId:
                '1900abaa3f30f82803c999bcd4a14a7a8a49256ebe8593a54c56583f75480e9di0',
              id: 'bitcoin:1900abaa3f30f82803c999bcd4a14a7a8a49256ebe8593a54c56583f75480e9di0',
            },
          },
        ],
        willSend: [
          {
            balance: '57330 satoshis',
          },
        ],
      })
      expect(displayDetails.warnings).toEqual([])
    })

    it('estimates changes for a TX that sells an Ordinal on ME', async () => {
      const { transactions, indexToAddressRecord, walletAddresses } =
        magicEdenSellOrdinalsFixtures['sell-1-ordinal']

      const { balanceChanges } = await simulateTransactions({
        asset,
        transactions,
        indexToAddressRecord,
        walletAddresses,
      })

      expect(simplifyForAssertion(balanceChanges)).toEqual({
        willApprove: [],
        willPayFee: [
          {
            balance: '0 satoshis',
          },
        ],
        willReceive: [
          {
            balance: '19900 satoshis',
          },
        ],
        willSend: [
          {
            balance: '1 base',
            nft: {
              compositeId:
                '0c2577c8baa4b1e44ae1d97419c9557861d9bc0fa32cbbbd14c39b1976239510i0',
              id: 'bitcoin:0c2577c8baa4b1e44ae1d97419c9557861d9bc0fa32cbbbd14c39b1976239510i0',
            },
          },
        ],
      })
    })

    it('estimates changes for a TX that sells two Ordinals on ME', async () => {
      const { transactions, indexToAddressRecord, walletAddresses } =
        magicEdenSellOrdinalsFixtures['sell-2-ordinals']

      const { balanceChanges, displayDetails } = await simulateTransactions({
        asset,
        transactions,
        indexToAddressRecord,
        walletAddresses,
      })

      expect(simplifyForAssertion(balanceChanges)).toEqual({
        willApprove: [],
        willPayFee: [
          {
            balance: '0 satoshis',
          },
        ],
        willReceive: [
          {
            balance: '19801 satoshis',
          },
        ],
        willSend: [
          {
            balance: '1 base',
            nft: {
              compositeId:
                '878744a3dabf45b938d97fdef0bf08c815896064b5376917e17882fefe4dfe84i0',
              id: 'bitcoin:878744a3dabf45b938d97fdef0bf08c815896064b5376917e17882fefe4dfe84i0',
            },
          },
          {
            balance: '1 base',
            nft: {
              compositeId:
                '0c2577c8baa4b1e44ae1d97419c9557861d9bc0fa32cbbbd14c39b1976239510i0',
              id: 'bitcoin:0c2577c8baa4b1e44ae1d97419c9557861d9bc0fa32cbbbd14c39b1976239510i0',
            },
          },
        ],
      })

      expect(displayDetails.warnings).toEqual([])
    })

    it('warns if Ordinals transfers can not be simulated', async () => {
      const { transactions, indexToAddressRecord, walletAddresses } =
        magicEdenSellOrdinalsFixtures['sell-2-ordinals']

      const { balanceChanges, displayDetails } = await simulateTransactions({
        asset: {
          ...baseAsset,
          insightClient: {
            fetchTxObject: jest.fn().mockImplementation(() => {
              throw new Error('API call error!')
            }),
          },
        },
        transactions,
        indexToAddressRecord,
        walletAddresses,
      })

      expect(simplifyForAssertion(balanceChanges)).toEqual({
        willApprove: [],
        willPayFee: [
          {
            balance: '0 satoshis',
          },
        ],
        willReceive: [
          {
            balance: '19801 satoshis',
          },
        ],
        willSend: [],
      })

      expect(displayDetails.warnings).toEqual([
        'The transaction may include Ordinals transfers that we were not able to detect.',
      ])
    })

    it('estimates changes for a simple wallet transfer', async () => {
      const address = 'bc1q84sev79thafnlludtwmd8dwcxnhg2sg23ugf80'
      const walletAddresses = {
        [address]: true,
      }
      const { balanceChanges, advancedDetails, displayDetails } =
        await simulateTransactions({
          asset,
          transactions: [fixtures['wallet-transfer'].psbtBase64],
          indexToAddressRecord: {
            0: { address },
          },
          walletAddresses,
        })
      expect(balanceChanges.willPayFee[0].balance.toNumber()).toEqual(
        fixtures['wallet-transfer'].fee,
      )
      expect(balanceChanges.willSend[0].balance.toNumber()).toEqual(
        fixtures['wallet-transfer'].sending,
      )
      expect(advancedDetails.inputs[0].address).toEqual(address)
      expect(advancedDetails.inputs[0].txID).toEqual(
        'ab858676c48825586db1b3b508fa79505cb3527aaa85a1bf452e261a2a3d4921',
      )

      const selfSendUTXO = advancedDetails.outputs[0]
      expect(selfSendUTXO.isWalletAddress).toBeTruthy()
      expect(selfSendUTXO.address).toEqual(address)
      expect(displayDetails.warnings).toEqual([])
    })

    it('gracefully handles an invalid Psbt buffer', async () => {
      const address = 'bc1q84sev79thafnlludtwmd8dwcxnhg2sg23ugf80'
      const walletAddresses = {
        [address]: true,
      }
      const { balanceChanges, advancedDetails, warnings } =
        await simulateTransactions({
          asset,
          transactions: [fixtures['invalid-Psbt-buffer'].psbtBase64],
          indexToAddressRecord: {
            0: { address },
          },
          walletAddresses,
        })

      expect(factoryDependencies.logger.error).toHaveBeenCalledWith(
        new Error(
          'Format Error: Magic Number must be followed by 0xff separator',
        ),
      )
      expect(balanceChanges.willPayFee).toEqual([])
      expect(balanceChanges.willSend).toEqual([])
      expect(advancedDetails.inputs).toEqual([])
      expect(warnings[0].kind).toEqual('INTERNAL_ERROR')
    })

    it('properly warns if a non-existing input requested to sign', async () => {
      const address = 'bc1qnm2529fk6j48zz28gp2j2lz72vls3u8fck7d20'
      const walletAddresses = {
        [address]: true,
      }
      const { balanceChanges, advancedDetails, warnings } =
        await simulateTransactions({
          asset,
          transactions: [fixtures['invalid-input-to-sign'].psbtBase64],
          indexToAddressRecord: {
            2: { address },
          },
          walletAddresses,
        })

      expect(factoryDependencies.logger.error).toHaveBeenCalledWith(
        new Error('The PSBT does not have input#2'),
      )
      expect(balanceChanges.willPayFee).toEqual([])
      expect(balanceChanges.willSend).toEqual([])
      expect(advancedDetails.inputs).toEqual([])
      expect(warnings).toEqual([
        {
          kind: 'INTERNAL_ERROR',
          severity: 'HIGH',
          message:
            'Invalid Bitcoin transaction is passed. Balance changes can not be estimated.',
        },
      ])
    })

    describe('Runes', () => {
      it('correctly estimates changes for an etch', async () => {
        const { transactions, indexToAddressRecord, walletAddresses } =
          runesFixtures['etch-1-rune']

        const { balanceChanges, displayDetails, advancedDetails } =
          await simulateTransactions({
            asset,
            transactions,
            indexToAddressRecord,
            walletAddresses,
          })

        expect(simplifyForAssertion(balanceChanges)).toEqual({
          willApprove: [],
          willPayFee: [
            {
              balance: '31590 satoshis',
            },
          ],
          willReceive: [],
          willSend: [
            {
              balance: '43110 satoshis',
            },
          ],
        })
        expect(simplifyForAssertion(advancedDetails)).toEqual({
          inputs: [
            {
              address: '3FxphuTDQsJoxQySrkYsA7qEeSGoUbZHC6',
              index: 1,
              txID: 'a15245fae294f733f2e205b2a0db099912c1cfe27d6b588a449c696fcd1eebf7',
              value: '149403 satoshis',
            },
          ],
          outputs: [
            {
              address:
                'bc1p35rl3umzvqh06al53a7wq8krku4ague94pwhn76t5ye390sepnqsypegcu',
              isWalletAddress: false,
              value: '32412 satoshis',
            },
            {
              address:
                'bc1p32nktsuffprllv0j93a2d3q33s0l6rlh598hynkgrt60lf6upqmqasw00d',
              isWalletAddress: false,
              value: '10698 satoshis',
            },
            {
              address: 'OP_RETURN OP_13 1603',
              isWalletAddress: false,
              value: '0 satoshis',
            },
            {
              address: '3FxphuTDQsJoxQySrkYsA7qEeSGoUbZHC6',
              isWalletAddress: true,
              value: '74703 satoshis',
            },
          ],
        })
        expect(displayDetails.warnings).toEqual([])
      })
    })
  })
})
