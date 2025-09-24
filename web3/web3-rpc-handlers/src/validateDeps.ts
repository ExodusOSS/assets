import type { CommonDeps } from './types.js'
import type { AppDeps, WalletDeps } from '@exodus/web3-types'

export function validate(
  value: Record<string, unknown>,
  requiredKeys: string[],
  optionalKeys: string[] = [],
) {
  const passedKeys = Object.keys(value)

  const validKeys = [...requiredKeys, ...optionalKeys]
  const invalidKeys = passedKeys.filter((key) => !validKeys.includes(key))
  if (invalidKeys.length > 0) {
    throw new Error(`Invalid dependencies provided: ${invalidKeys}`)
  }

  for (const requiredKey of requiredKeys) {
    if (!passedKeys.includes(requiredKey)) {
      throw new Error(`Missing dependency: ${requiredKey}`)
    }
  }
}

function validateAppDeps(deps: AppDeps) {
  const requiredKeys = [
    'approveConnection',
    'approveMessage',
    'approveTransactions',
    'ensureTrusted',
    'isAutoApproved',
    'isTrusted',
    'addConnection',
    'getOrigin',
    'scanDomains',
  ]
  const optionalKeys = [
    'getAsset',
    'isDevelopmentEnvironment',
    'getIsConnected',
    'onTransactionsSigned',
    'getPathname',
    'getConnectedAccounts',
    'ensureUntrusted',
  ]
  validate(deps, requiredKeys, optionalKeys)
}

function validateWalletDeps(deps: WalletDeps) {
  const requiredKeys: string[] = []
  const optionalKeys = ['ensureUnlocked', 'isUnlocked', 'reportMaliciousSite']
  validate(deps, requiredKeys, optionalKeys)
}

export function validateCommonDeps(
  deps: CommonDeps,
  otherOptionalKeys: string[] = [],
) {
  const requiredKeys = ['app']
  const optionalKeys = ['wallet', ...otherOptionalKeys]
  validate(
    deps as unknown as Record<string, unknown>,
    requiredKeys,
    optionalKeys,
  )

  const { app, wallet } = deps

  validateAppDeps(app)

  if (wallet) {
    validateWalletDeps(wallet)
  }
}
