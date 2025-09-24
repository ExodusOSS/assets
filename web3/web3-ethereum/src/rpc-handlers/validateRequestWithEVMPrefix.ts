import { validateRequest } from './validator.js'

import type { EthRequestArguments } from '../types.js'

export function validateRequestWithEVMPrefix(request: EthRequestArguments) {
  if (typeof request !== 'object') {
    return validateRequest(request)
  }

  const originalMethod = request?.method
  if (!originalMethod || typeof originalMethod !== 'string') {
    return validateRequest(request)
  }

  const underscorePosition = originalMethod.indexOf('_')
  if (underscorePosition === -1) {
    return validateRequest(request)
  }

  // 0x1_eth_getAccounts -> eth_getAccounts
  const methodWithoutPrefix = originalMethod.slice(underscorePosition + 1)

  // NOTE: validateRequest can deeply mutate the argument, e.g. removing additional properties.
  // We should always use the result of validateRequest() call, and never use the original argument again.
  const validated = validateRequest({ ...request, method: methodWithoutPrefix })

  return { ...(validated as Record<string, unknown>), method: originalMethod }
}
