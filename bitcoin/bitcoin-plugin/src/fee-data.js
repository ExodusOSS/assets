import { FeeData } from '@exodus/asset-lib'

export const _defaults = {
  feePerKB: '68000 satoshis',
  fastestFee: '68 satoshis',
  halfHourFee: '60 satoshis',
  hourFee: '50 satoshis',
  nextBlockMinimumFee: '60 satoshis',
  minimumFee: '10 satoshis',
  maxExtraCpfpFee: 100_000, // 100k statoshis, this is not a UnitType because it could be overridden with remote configs
  rbfBumpFeeBlocks: 3,
  rbfBumpFeeThreshold: 0.8,
  rbfEnabled: true,
  utxoDustValue: 0,
}
export const bitcoinFeeDataFactory = ({ currency, overrideDefaults }) =>
  new FeeData({ config: { ..._defaults, ...overrideDefaults }, mainKey: 'feePerKB', currency })
