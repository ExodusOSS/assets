import { runEvmIndexTestSuite } from '@exodus/ethereum-api/src/__tests__/index.testsuite.js'

import assetPlugin from '../index.js'

describe(`ethereum index.js test`, () => {
  runEvmIndexTestSuite({ assetPlugin })

  test('customTokens and nfts should be true by default when no config', () => {
    const asset = assetPlugin.createAsset({ assetClientInterface: {} })
    expect(asset.api.features.customTokens).toEqual(true)
    expect(asset.api.features.nfts).toEqual(true)
  })

  test('customTokens and nfts should be true when empty config', () => {
    const asset = assetPlugin.createAsset({ assetClientInterface: {}, config: {} })
    expect(asset.api.features.customTokens).toEqual(true)
    expect(asset.api.features.nfts).toEqual(true)
  })

  test('customTokens and nfts should be false when customized', () => {
    const asset = assetPlugin.createAsset({
      assetClientInterface: {},
      config: { customTokens: false, nfts: false },
    })
    expect(asset.api.features.customTokens).toEqual(false)
    expect(asset.api.features.customTokens).toEqual(false)
  })

  test('feeData gasLimits update', () => {
    const asset = assetPlugin.createAsset({ assetClientInterface: {} })

    const feeData = asset.api.getFeeData().update({
      gasLimits: {
        another_ethereum_token: {
          gasLimitMultiplier: 1.9,
        },
      },
    })
    expect(feeData.toJSON()).toEqual({
      baseFeePerGas: '50 Gwei',
      eip1559Enabled: true,
      enableFeeDelegation: false,
      fuelThreshold: '0.025 ETH',
      gasLimits: {
        aave: {
          fixedGasLimit: 250_000,
        },
        amp: {
          fixedGasLimit: 151_000,
        },
        another_ethereum_token: {
          gasLimitMultiplier: 1.9,
        },
        gusd_ethereum_1ea2a0d4: {
          fixedGasLimit: 75_000,
        },
        snx: {
          fixedGasLimit: 220_000,
        },
        tetherusd: {
          fixedGasLimit: 70_000,
        },
        usdcoin: {
          fixedGasLimit: 70_000,
        },
      },
      gasPrice: '75 Gwei',
      gasPriceMaximumRate: 1.3,
      gasPriceMinimumRate: 0.5,
      gasPriceMultiplier: 1,
      max: '250 Gwei',
      min: '1 Gwei',
      origin: '75 Gwei',
      rbfEnabled: true,
      swapFee: '0.05 ETH',
      tipGasPrice: '0.5 Gwei',
    })
  })
})
