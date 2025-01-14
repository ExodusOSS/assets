export const isNftBrc20 = (nft) => {
  if (nft.isBrc20) {
    return true
  }

  // Void/Spent brc20 are not flagged as brc20
  const isTextContentType =
    nft.contentType?.startsWith('text/plain') || nft.contentType?.startsWith('application/json')

  if (!isTextContentType || !nft.contentBody) {
    return false
  }

  try {
    const json = JSON.parse(Buffer.from(nft.contentBody, 'base64').toString())
    return json?.p.toLowerCase() === 'brc-20'
  } catch {}

  return false
}
