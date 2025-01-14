import * as bitcoinjsOriginal from '@exodus/bitcoinjs'
import * as bech32 from 'bech32'
import bs58check from 'bs58check'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { identity, pickBy } = lodash

export const createBtcLikeAddress = ({
  versions,
  coinInfo,
  bitcoinjsLib: bitcoinjsLibFork,
  useBip86 = false,
  validateFunctions = {},
  extraFunctions = {},
}) => {
  assert(versions, 'versions is required')
  assert(coinInfo, 'coinInfo is required')

  const bs58validateFactory = (version) =>
    version === undefined
      ? undefined
      : (string) => {
          const payload = bs58check.decodeUnsafe(string)
          return !!payload && payload.length === 21 && payload[0] === version
        }

  const bech32ValidateFactory = (version, length) =>
    version === undefined
      ? undefined
      : (string) => {
          try {
            const decoded = bech32.decode(string)
            // bech32 lib normalizes prefixes, so not worrying about uppercase
            if (decoded.prefix !== versions.bech32) return false
            // NOTE: We only support version zero witness programs
            if (decoded.words[0] !== 0) return false
            // Ensure correct length
            return bech32.fromWords(decoded.words.slice(1)).length === length
          } catch {
            return false
          }
        }

  const isP2PKH = validateFunctions.isP2PKH || bs58validateFactory(versions.p2pkh)
  const isP2SH = validateFunctions.isP2SH || bs58validateFactory(versions.p2sh)
  const isP2SH2 = validateFunctions.isP2SH2 || bs58validateFactory(versions.p2sh2)
  const isP2WPKH = validateFunctions.isP2WPKH || bech32ValidateFactory(versions.bech32, 20)
  const isP2WSH = validateFunctions.isP2WSH || bech32ValidateFactory(versions.bech32, 32)
  const isP2TR =
    validateFunctions.isP2TR ||
    (useBip86 &&
      bitcoinjsLibFork &&
      ((addr) => {
        try {
          const network = coinInfo.toBitcoinJS()
          bitcoinjsLibFork.payments.p2tr({ address: addr, network })
          return true
        } catch {
          return false
        }
      })) ||
    undefined

  const purposeValidators = [
    { purpose: 44, validator: isP2PKH },
    { purpose: 49, validator: isP2SH },
    { purpose: 84, validator: isP2WPKH },
    { purpose: 86, validator: isP2TR },

    // What are these 2?
    // { purpose: ?, validator: isP2WSH },
    // { purpose: ?, validator: isP2SH2 },
  ].filter(({ validator }) => validator)

  const resolvedValidateFunctions = pickBy(
    {
      isP2PKH,
      isP2SH,
      isP2SH2,
      isP2WPKH,
      isP2WSH,
      isP2TR,
    },
    identity
  )
  const resolvePurpose = (string) =>
    purposeValidators.find(({ validator }) => validator(string))?.purpose
  const validate = (string) => Object.values(resolvedValidateFunctions).some((fn) => fn(string))

  const toScriptPubKey = (string) => {
    const network = coinInfo.toBitcoinJS()
    return bitcoinjsOriginal.address.toOutputScript(string, network)
  }

  const fromScriptPubKey = (scriptPubKey) => {
    if (typeof scriptPubKey === 'string') scriptPubKey = Buffer.from(scriptPubKey, 'hex')
    const network = coinInfo.toBitcoinJS()
    return bitcoinjsOriginal.address.fromOutputScript(scriptPubKey, network)
  }

  return pickBy(
    {
      versions,
      ...resolvedValidateFunctions,
      validate,
      resolvePurpose,
      toScriptPubKey,
      fromScriptPubKey,
      ...extraFunctions,
    },
    identity
  )
}
