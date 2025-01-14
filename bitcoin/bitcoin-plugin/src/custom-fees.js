export const createCustomFeesApi = ({ baseAsset }) => {
  return {
    getRecommendedMinMaxFeeUnitPrices: ({ feeData }) => {
      return {
        recommended: feeData.fastestFee.toBaseNumber(),
        min: feeData.minimumFee.toBaseNumber(),
        max: feeData.fastestFee.toBaseNumber() * 3,
      }
    },
    unit: 'sat/byte',
    feeUnitPriceToNumber: (feeNumberUnit) => feeNumberUnit.div(1000).toBaseNumber(),
    numberToFeeUnitPrice: (value) => baseAsset.currency.baseUnit(value * 1000),
    isEnabled: ({ feeData }) => Boolean(feeData.rbfEnabled),
  }
}
