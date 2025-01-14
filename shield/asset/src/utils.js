export function extractUnits({ token, baseUnitName = 'base' }) {
  if (token.units) return token.units

  // build units object
  const units = { [baseUnitName]: 0 }
  // order here matters, which is why this is broken up for the conditional alias

  if (token.tickerAliases) token.tickerAliases.forEach((alias) => (units[alias] = token.decimals))
  if (token.tickerAlias) units[token.tickerAlias] = token.decimals
  units[token.ticker] = token.decimals
  return units
}
