import type { MessageSimulationResult } from '@exodus/web3-types'

const ethereumAddressRegex = /\b0x[a-fA-F0-9]{40}\b/g
const solanaAddressRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g
const domainRegex = /\bhttps?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?\b/g

const doesIncludeLoginMessage = (message: string) => {
  return ['sign in', 'sign-in', 'login', 'authenticate'].some((loginMessage) =>
    message.toLowerCase().includes(loginMessage),
  )
}

export const findAddresses = (message: string): string[] => {
  return [
    message.match(solanaAddressRegex) ?? [],
    message.match(ethereumAddressRegex) ?? [],
  ].flat()
}

// Returns a list of URLs in the message.
export const findURLs = (message: string): URL[] => {
  const domainStrings = message.match(domainRegex) ?? []

  return domainStrings
    .map((domainString) => {
      try {
        return new URL(domainString)
      } catch (err) {
        // Swallowing errors since it's expected that many of the found domain strings won't be valid URLs.
        return null
      }
    })
    .filter((url): url is URL => url !== null)
}

export const tryParsingSIWE = ({
  address,
  message,
  url,
  simulationResult,
}: {
  address: string
  message: string
  url: URL
  simulationResult: MessageSimulationResult
}): void => {
  const includesLoginMessage = doesIncludeLoginMessage(message)
  if (!includesLoginMessage) {
    return
  }

  // If the message contains addresses, ensure
  // 1. it includes just one unique address;
  // 2. the unique address matches the user's address.
  const foundAddresses = Array.from(new Set(findAddresses(message)))
  if (foundAddresses.length > 1) {
    return
  }
  if (
    foundAddresses.some(
      (addressInMessage) =>
        addressInMessage.toLowerCase() !== address.toLowerCase(),
    )
  ) {
    return
  }

  // If the message contains domains, ensure they match the dApp domain (the passed "url" parameter).
  // Note: we only check domains before the "Resources" keyword, see https://eips.ethereum.org/EIPS/eip-4361#message-format.
  const foundURLs = findURLs(message.split('Resources')[0])
  if (
    foundURLs.some((urlInMessage) => urlInMessage.hostname !== url.hostname)
  ) {
    return
  }

  simulationResult.kind = {
    kind: 'SIWE',
    info: {
      date: new Date(),
      statement: `Sign in to ${url.hostname}.`,
    },
  }

  return
}
