import { FeeData } from '@exodus/asset-lib'

export const createFeeData = ({ asset }) =>
  new FeeData({
    config: {
      fee: `0.000005 ${asset.ticker}`,
      baseFee: `0.000005 ${asset.ticker}`,
      priorityFee: 1_000_000,
      fuelThreshold: `0.000015 ${asset.ticker}`,
      computeUnitsMultiplier: 1, // compute units buffer, increasing to > 1 can cause Dust issues.
    },
    mainKey: 'fee',
    currency: asset.currency,
  })
