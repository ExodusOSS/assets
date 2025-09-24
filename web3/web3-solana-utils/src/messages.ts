import type { Base64, Bytes } from '@exodus/web3-types'

import type {
  SolanaSignInInputWithRequiredFields,
  SolDisplayEncoding as DisplayEncoding,
} from './types.js'

// TODO: Dedupe.
export function encodeMessage(message: string): Bytes {
  return new Uint8Array(Buffer.from(message))
}

// TODO: Dedupe.
export function decodeMessage(
  encodedMessage: Bytes,
  display: DisplayEncoding,
): string {
  if (display === 'utf8') {
    return Buffer.from(encodedMessage).toString()
  }

  if (display === 'hex') {
    return `0x${Buffer.from(encodedMessage).toString('hex')}`
  }

  throw new Error(`Unknown display: '${display}'`)
}

export function serializeEncodedMessage(encodedMessage: Bytes): Base64 {
  return Buffer.from(encodedMessage).toString('base64')
}

export function deserializeEncodedMessage(wireEncodedMessage: Base64): Bytes {
  return Buffer.from(wireEncodedMessage, 'base64')
}

// copied from: https://github.com/anza-xyz/wallet-standard/blob/6cfb9a0be49351dba765131e58d57536c31ae251/packages/core/util/src/signIn.ts#L32 to avoid bringing in the entire world of noble libs
export function createSignInMessageText(
  input: SolanaSignInInputWithRequiredFields,
): string {
  // ${domain} wants you to sign in with your Solana account:
  // ${address}
  //
  // ${statement}
  //
  // URI: ${uri}
  // Version: ${version}
  // Chain ID: ${chain}
  // Nonce: ${nonce}
  // Issued At: ${issued-at}
  // Expiration Time: ${expiration-time}
  // Not Before: ${not-before}
  // Request ID: ${request-id}
  // Resources:
  // - ${resources[0]}
  // - ${resources[1]}
  // ...
  // - ${resources[n]}

  let message = `${input.domain} wants you to sign in with your Solana account:\n`
  message += `${input.address}`

  if (input.statement) {
    message += `\n\n${input.statement}`
  }

  const fields: string[] = []
  if (input.uri) {
    fields.push(`URI: ${input.uri}`)
  }

  if (input.version) {
    fields.push(`Version: ${input.version}`)
  }

  if (input.chainId) {
    fields.push(`Chain ID: ${input.chainId}`)
  }

  if (input.nonce) {
    fields.push(`Nonce: ${input.nonce}`)
  }

  if (input.issuedAt) {
    fields.push(`Issued At: ${input.issuedAt}`)
  }

  if (input.expirationTime) {
    fields.push(`Expiration Time: ${input.expirationTime}`)
  }

  if (input.notBefore) {
    fields.push(`Not Before: ${input.notBefore}`)
  }

  if (input.requestId) {
    fields.push(`Request ID: ${input.requestId}`)
  }

  if (input.resources) {
    fields.push(`Resources:`)
    for (const resource of input.resources) {
      fields.push(`- ${resource}`)
    }
  }

  if (fields.length > 0) {
    message += `\n\n${fields.join('\n')}`
  }

  return message
}
