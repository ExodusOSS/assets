import type { SolanaSignInInput } from '@exodus/solana-wallet-standard-features'
import type { SendOptions } from '@exodus/solana-web3.js/lib/connection.js'
import type { Base58, Base64 } from '@exodus/web3-types'
import type { WalletAccount } from '@wallet-standard/base'

export type RpcSignAndSendAllParams = [
  inputs: { transaction: Base64; options: SendOptions }[],
  options?: { parallel?: boolean },
]
export type RpcSignAndSendAllResult = PromiseSettledResult<Base64>[]

export type RpcSignInParams = SolanaSignInInput

export type RpcSignInResult = {
  accounts: Omit<WalletAccount, 'publicKey'>[]
  signedMessage: Base64
  signature: Base64
  signatureType?: 'ed25519'
}

export type RpcConnectParams = {
  onlyIfTrusted?: boolean
  silent?: boolean
}

export type RpcConnectResult = { name: string; address: Base58 }[]

export type RpcSignMessageParams = [
  message: Base64,
  options: { display: 'utf8' | 'hex'; address?: Base58 },
]
