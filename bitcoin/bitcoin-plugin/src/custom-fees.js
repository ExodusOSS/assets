export const createCustomFeesApi = ({ baseAsset, feeData: defaultFeeData }) => {
  return {
    getRecommendedMinMaxFeeUnitPrices: ({ feeData = defaultFeeData }) => {
      const minFee = feeData.minimumFee.toBaseNumber()
      const fastestFee = feeData.fastestFee.toBaseNumber()

      return {
        recommended: fastestFee,
        min: minFee,
        max: fastestFee * 3,
      }
    },
    unit: 'sat/byte',
    feeUnitPriceToNumber: (feeNumberUnit) => feeNumberUnit?.div(1000).toBaseNumber() || 0,
    numberToFeeUnitPrice: (value) => baseAsset.currency.baseUnit(value * 1000),
    isEnabled: ({ feeData = defaultFeeData }) => Boolean(feeData.rbfEnabled),
  }
}
