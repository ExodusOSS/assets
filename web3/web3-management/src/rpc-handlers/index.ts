import RPC from '@exodus/json-rpc'
import { RPC_REQUEST_TIMEOUT } from '@exodus/web3-constants'
import { validate as validateDeps } from '@exodus/web3-rpc-handlers'

import { exposeHandlers } from './exposeHandlers.js'
import { validateRequest } from './validator.js'

import type { Dependencies, ManagementDeps } from '../types.js'
import type { Transport } from '@exodus/web3-types'

const validateManagementDeps = (deps: ManagementDeps) => {
  const requiredKeys = ['chooseWallet']
  const optionalKeys = ['']
  validateDeps(
    deps as unknown as Record<string, unknown>,
    requiredKeys,
    optionalKeys,
  )
}

export const registerRPCHandlers = (
  transport: Transport,
  deps: Dependencies,
) => {
  const { app, management } = deps

  validateManagementDeps(management)

  const rpc = new RPC({
    transport,
    parse: validateRequest,
    getIsDevelopmentMode: () => app.isDevelopmentEnvironment?.() ?? false,
    requestTimeout: RPC_REQUEST_TIMEOUT,
  })

  exposeHandlers(rpc, { ...app, ...management })

  return rpc
}
