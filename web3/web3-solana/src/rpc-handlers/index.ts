import { RPC_REQUEST_TIMEOUT } from '@exodus/web3-constants'
import {
  validate as validateDeps,
  validateCommonDeps,
} from '@exodus/web3-rpc-handlers'

import { exposeHandlers } from './exposeHandlers.js'
import { exposeSolanaMobileHandlers } from './exposeSolanaMobileHandlers.js'
import { validateRequest } from './validator.js'

import type { Dependencies } from '../types.js'
import type { RPC, Transport } from '@exodus/web3-types'

export { createSolanaDepsFactory } from './createSolanaDeps.js'

export const registerRPCHandlers = ({
  deps,
  RPC,
  transport,
}: {
  deps: Dependencies
  RPC: RPC
  transport: Transport
}) => {
  validateCommonDeps(deps, ['solana', 'solanaMobile'])
  if (!deps.solana && !deps.solanaMobile) {
    throw new Error(
      'Either `solana` or `solanaMobile` deps needs to be supplied.',
    )
  }
  if (!RPC) {
    throw new Error('"RPC" constructor parameter is required')
  }
  if (!transport) {
    throw new Error('"transport" parameter is required')
  }

  if (deps.solana) {
    const requiredKeys = [
      'getLatestBlockhash',
      'getPublicKey',
      'sendRawTransaction',
      'simulateSolanaTransactions',
      'transactionSigner',
      'messageSigner',
      'getActiveWalletAccountData',
    ]
    const optionalKeys = ['getAsset']

    validateDeps(
      deps.solana as unknown as Record<string, unknown>,
      requiredKeys,
      optionalKeys,
    )
  }
  if (deps.solanaMobile) {
    const requiredKeys = [
      'getPublicKey',
      'getSecretKey',
      'sendRawTransaction',
      'setPublicKey',
      'simulateSolanaTransactions',
    ]

    validateDeps(
      deps.solanaMobile as unknown as Record<string, unknown>,
      requiredKeys,
    )
  }

  const { app, wallet } = deps

  const rpc = new RPC({
    transport,
    parse: validateRequest as <T>(request: T) => Record<string, unknown>,
    getIsDevelopmentMode: () => app.isDevelopmentEnvironment?.() ?? false,
    requestTimeout: RPC_REQUEST_TIMEOUT,
  })

  if (deps.solana) {
    exposeHandlers(rpc, { ...app, ...deps.solana, ...wallet })
  }

  if (deps.solanaMobile) {
    exposeSolanaMobileHandlers(rpc, {
      ...app,
      ...deps.solanaMobile,
      ...wallet,
    })
  }

  return rpc
}
