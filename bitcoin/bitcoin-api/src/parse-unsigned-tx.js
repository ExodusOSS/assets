import { Transaction as BitcoinTransactionClass } from '@exodus/bitcoinjs'
import BIPPath from 'bip32-path'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

export const parseUnsignedTxFactory =
  ({ Transaction = BitcoinTransactionClass } = {}) =>
  async ({ asset, unsignedTx, getAddress }) => {
    const assetName = asset.name

    const toNumberUnit = (value) => {
      const parsed = Buffer.isBuffer(value) ? BigInt('0x' + value.reverse().toString('hex')) : value // handle Dogecoin buffer values
      return asset.currency.baseUnit(parsed)
    }

    const parseAddress = assetName === 'bcash' ? asset.address.toCashAddress : (address) => address

    const { inputs, outputs } = unsignedTx.txData

    const from = lodash.uniq(inputs.map(({ address }) => parseAddress(address)))
    const outputAddresses = lodash.uniq(outputs.map(([address]) => address))
    const inputTxIds = lodash.uniq(inputs.map(({ txId }) => txId))
    const insightClient = asset.baseAsset.insightClient
    const inputTxsRaw = await Promise.all(inputTxIds.map((txId) => insightClient.fetchRawTx(txId)))
    const inputTxsById = new Map(
      inputTxsRaw.map((hex) => {
        const tx = Transaction.fromHex(hex)
        return [tx.getId(), tx]
      })
    )

    inputs.forEach(({ txId, vout, value }) => {
      const tx = inputTxsById.get(txId)
      const output = tx.outs[vout]
      const expected = output.value
      assert(
        lodash.isEqual(expected, value),
        `${txId} tx input has invalid value. Expected: ${expected} , Actual: ${value}`
      )
    })

    const { addressPathsMap } = unsignedTx.txMeta
    const [changeOutputAddresses, toOutputAddresses] = lodash.partition(
      outputAddresses,
      (address) => {
        const path = addressPathsMap[address]
        if (!path) return false

        const [chain, index] = BIPPath.fromString(path).path
        const isOurs = getAddress({ chain, index }).toString() === address
        return isOurs && chain === 1
      }
    )

    // the user is explicitly sending to a change address, so take a wild guess
    if (toOutputAddresses.length === 0) {
      toOutputAddresses.push(changeOutputAddresses.pop())
    }

    const [changeOutputs, sendOutputs] = lodash.partition(outputs, ([address]) =>
      changeOutputAddresses.includes(address)
    )

    const sum = (arr) => arr.reduce((a, b) => a.add(b), asset.currency.ZERO)
    const sumOutputs = (outputs) => sum(outputs.map(([_, value]) => toNumberUnit(value)))

    // sum(inputs) = intendedSendAmount + fee + change
    // sum(outputs) = intendedSendAmount + change

    const inputsNF = inputs.map(({ value }) => toNumberUnit(value))
    const outputsNF = outputs.map(([_, value]) => toNumberUnit(value))
    const changeAmount = sumOutputs(changeOutputs)
    const amount = sumOutputs(sendOutputs)

    const inputsTotal = sum(inputsNF)
    const outputsTotal = sum(outputsNF)
    const fee = inputsTotal.sub(outputsTotal)

    const changeAddress =
      changeOutputAddresses.length > 0 ? parseAddress(changeOutputAddresses[0]) : null
    // TODO: return entire toOutputAddresses array
    assert(toOutputAddresses.length === 1, 'multiple outputs not supported yet in 2fa mode')

    const to = parseAddress(toOutputAddresses[0])
    return {
      asset,
      from,
      to,
      amount,
      changeAddress,
      changeAmount,
      fee,
    }
  }

export const parseUnsignedTx = parseUnsignedTxFactory()
