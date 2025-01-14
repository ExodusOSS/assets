import { FeeData } from '@exodus/asset-lib'

export const createFeeData = ({ asset }) =>
  new FeeData({
    config: {
      fee: `0.000005 ${asset.ticker}`,
      priorityFee: 1_000_000,
      fuelThreshold: `0.000015 ${asset.ticker}`,
      computeUnitsMultiplier: 4, // compute units buffer
    },
    mainKey: 'fee',
    currency: asset.currency,
  })
