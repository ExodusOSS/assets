import { getDefaultPathIndexes } from '../address-path.js'

const oldEthereum = {
  get baseAsset() {
    return oldEthereum
  },
  api: {
    defaultAddressPath: 'm/0/0',
  },
}

const newEthereum = {
  get baseAsset() {
    return newEthereum
  },
  api: {
    getDefaultAddressPath: ({ compatibilityMode, walletAccount }) =>
      compatibilityMode === 'feri'
        ? 'm/42/42'
        : walletAccount?.name === 'fer'
          ? 'm/20/16'
          : 'm/0/0',
  },
}

const oldErc20 = {
  baseAsset: oldEthereum,
}

const newErc20 = {
  baseAsset: newEthereum,
}

test('gets default path indexes for asset with defaultAddressPath', () => {
  expect(getDefaultPathIndexes({ asset: oldErc20 })).toEqual({ chainIndex: 0, addressIndex: 0 })
  expect(getDefaultPathIndexes({ asset: oldEthereum })).toEqual({ chainIndex: 0, addressIndex: 0 })
})

test('gets default path indexes for asset with getDefaultAddressPath', () => {
  expect(getDefaultPathIndexes({ asset: newErc20 })).toEqual({ chainIndex: 0, addressIndex: 0 })
  expect(getDefaultPathIndexes({ asset: newEthereum })).toEqual({ chainIndex: 0, addressIndex: 0 })
})

test('respects compatibilityMode', () => {
  expect(getDefaultPathIndexes({ asset: newErc20, compatibilityMode: 'feri' })).toEqual({
    chainIndex: 42,
    addressIndex: 42,
  })
  expect(getDefaultPathIndexes({ asset: newEthereum, compatibilityMode: 'feri' })).toEqual({
    chainIndex: 42,
    addressIndex: 42,
  })
})

test('respects walletAccount', () => {
  const walletAccount = { name: 'fer' }
  expect(getDefaultPathIndexes({ asset: newErc20, walletAccount })).toEqual({
    chainIndex: 20,
    addressIndex: 16,
  })
  expect(getDefaultPathIndexes({ asset: newEthereum, walletAccount })).toEqual({
    chainIndex: 20,
    addressIndex: 16,
  })
})
