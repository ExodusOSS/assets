import { RPC_REQUEST_TIMEOUT } from '@exodus/web3-constants'
import {
  validate as validateDeps,
  validateCommonDeps,
} from '@exodus/web3-rpc-handlers'

import { exposeHandlers } from './exposeHandlers.js'
import { validateRequestWithEVMPrefix } from './validateRequestWithEVMPrefix.js'
export { default as createEVMDepsFactory } from './createEVMDeps.js'

import type { Dependencies, EVMDeps } from '../types.js'
import type { RPC, Transport } from '@exodus/web3-types'

const validateEVMDeps = (evm: EVMDeps) => {
  const requiredKeys = [
    'chainId',
    'forwardRequest',
    'getAddress',
    'getEstimatedGas',
    'getFeeData',
    'getCustomFeeData',
    'getNonce',
    'sendRawTransaction',
    'simulateEthereumTransactions',
    'getActiveWalletAccountData',
    'transactionSigner',
    'messageSigner',
  ]
  const optionalKeys = [
    'getSupportedChainIds',
    'onEthWalletWatchAssetRequest',
    'addEthereumChain',
  ]
  validateDeps(
    evm as unknown as Record<string, unknown>,
    requiredKeys,
    optionalKeys,
  )
}

function validateEVMsDeps(evms: EVMDeps[]) {
  const chainIds = evms.map(({ chainId }) => chainId)
  const uniqueChainIds = [...new Set(chainIds)]
  if (chainIds.length !== uniqueChainIds.length) {
    throw new Error('EVMs must have unique chain IDs')
  }

  evms.forEach(validateEVMDeps)
}

export const registerRPCHandlers = ({
  deps,
  RPC,
  transport,
}: {
  deps: Dependencies
  RPC: RPC
  transport: Transport
}) => {
  validateCommonDeps(deps, ['evms'])
  validateEVMsDeps(deps.evms)
  if (!RPC) {
    throw new Error('"RPC" constructor parameter is required')
  }
  if (!transport) {
    throw new Error('"transport" parameter is required')
  }

  const { app, evms = [], wallet } = deps

  const rpc = new RPC({
    transport,
    parse: validateRequestWithEVMPrefix as <T>(
      request: T,
    ) => Record<string, unknown>,
    getIsDevelopmentMode: () => app.isDevelopmentEnvironment?.() ?? false,
    requestTimeout: RPC_REQUEST_TIMEOUT,
  })

  for (const evm of evms) {
    const evmDeps = { ...app, ...evm, ...wallet }
    exposeHandlers(rpc, evmDeps)
  }

  return rpc
}
