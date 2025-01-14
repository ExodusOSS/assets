export const getBtcVersions = (coinInfo) => ({
  p2pkh: coinInfo.versions.public,
  p2sh: coinInfo.versions.scripthash,
  bech32: coinInfo.bech32,
  segwit: `${coinInfo.bech32}1q`,
  taproot: `${coinInfo.bech32}1p`,
})
