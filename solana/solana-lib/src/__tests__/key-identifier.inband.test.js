import { createGetKeyIdentifier } from '../key-identifier.js'

describe('createGetKeyIdentifier', () => {
  let getKeyIdentifier
  beforeEach(() => {
    getKeyIdentifier = createGetKeyIdentifier({ bip44: 2_147_484_149 })
  })

  it('should use derivation path of Exodus', () => {
    const { derivationPath, derivationAlgorithm } = getKeyIdentifier({
      purpose: 44,
      accountIndex: 1,
      chainIndex: 0,
      addressIndex: 0,
    })
    expect(derivationPath).toEqual("m/44'/501'/1'/0/0")
    expect(derivationAlgorithm).toEqual('BIP32')
  })

  it('should use phantom compat mode', () => {
    const { derivationPath, derivationAlgorithm } = getKeyIdentifier({
      compatibilityMode: 'phantom',
      accountIndex: 0,
      purpose: 44,
    })
    expect(derivationPath).toEqual("m/44'/501'/0'/0'")
    expect(derivationAlgorithm).toEqual('SLIP10')
  })

  it('should use trust compat mode', () => {
    const { derivationPath, derivationAlgorithm } = getKeyIdentifier({
      compatibilityMode: 'trust',
      accountIndex: 0,
      purpose: 44,
    })
    expect(derivationPath).toEqual("m/44'/501'/0'")
    expect(derivationAlgorithm).toEqual('SLIP10')
  })

  it('should use mathwallet compat mode', () => {
    const { derivationPath, derivationAlgorithm } = getKeyIdentifier({
      compatibilityMode: 'mathwallet',
      accountIndex: 0,
      purpose: 44,
    })
    expect(derivationPath).toEqual("m/44'/501'/0'/0")
    expect(derivationAlgorithm).toEqual('BIP32')
  })

  it('should use ledger compat mode', () => {
    const { derivationPath, derivationAlgorithm } = getKeyIdentifier({
      compatibilityMode: 'ledger',
      accountIndex: 0,
      purpose: 44,
    })
    expect(derivationPath).toEqual("m/44'/501'/0'")
    expect(derivationAlgorithm).toEqual('SLIP10')
  })
})
