const CHANGE_DUST_VALUES = {
  bitcoin: 1500,
  bitcoinregtest: 1500,
  bitcointestnet: 1500,
  bitcoinsv: 5000,
  bcash: 6000,
  bgold: 6000,
  litecoin: 60_000,
  dash: 5500,
  dogecoin: 99_999_999,
  decred: 70_000,
  digibyte: 60_000,
  zcash: 1500,
  qtumignition: 400_000,
  ravencoin: 545,
  lightningnetwork: 20_000,
}

const SEND_DUST_VALUES = {
  bitcoin: 546,
  bitcoinregtest: 546,
  bitcointestnet: 546,
}

export const getChangeDustValue = (asset) => {
  const value = CHANGE_DUST_VALUES[asset.name]
  if (!value) {
    return
  }

  return asset.currency.baseUnit(value)
}

export const getSendDustValue = (asset) => {
  const value = SEND_DUST_VALUES[asset.name] ?? CHANGE_DUST_VALUES[asset.name]
  if (!value) {
    return
  }

  return asset.currency.baseUnit(value)
}
