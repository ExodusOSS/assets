import {
  UserDeclinedError,
  UserRejectedRequestError,
} from '@exodus/web3-errors'

import type { BaseConnectDependencies } from './types.js'
import type {
  ScanDomain200ResponseInner,
  ScanDomainsFn,
  ScanDomainsProcessedResult,
} from '@exodus/web3-types'

// Approves a security-sensitive action (e.g. signing a transaction).
// It should usually prompt a user's for consent (controlled by the 'isAutoApproved' parameter).
export async function approve<
  ApprovalFn extends (...args: unknown[]) => Promise<boolean>,
>(
  approvalFn: ApprovalFn,
  isAutoApproved: () => Promise<boolean>,
  ...args: unknown[]
): Promise<void | never> {
  const autoApproved = await isAutoApproved()
  if (autoApproved) {
    return
  }

  const approved = await approvalFn(...args)
  if (!approved) {
    throw new UserDeclinedError()
  }
}

export const enum DomainStatusEnum {
  SECURE,
  UNSECURE,
  UNKNOWN,
}

// Uses the `scanDomains` dependency to assess if the supplied domains are unsecure (e.g. phishing/scam dApps).
export async function getAreDomainsPotentiallyUnsecure({
  scanDomains,
  domains,
}: {
  scanDomains: ScanDomainsFn
  domains: string[]
}) {
  const scanResults = await scanDomains(domains)
  if (!scanResults) {
    return { status: DomainStatusEnum.UNKNOWN }
  }

  const status = scanResults.find(({ warnings }) => warnings?.length > 0)
    ? DomainStatusEnum.UNSECURE
    : DomainStatusEnum.SECURE

  const scanResult = processScanResults(scanResults)

  return { status, scanResult }
}

const processScanResults = (
  scanResults: ScanDomain200ResponseInner[],
): ScanDomainsProcessedResult | undefined => {
  if (!scanResults?.length || !scanResults[0].warnings.length) {
    return
  }

  const { warnings } = scanResults[0] // Pick the first result since we are scanning one domain per request.

  // "CRITICAL" warnings should be prioritized in the list.
  const warningsSorted = warnings.sort((a, b) => {
    if (a.severity === 'CRITICAL' && b.severity === 'WARNING') {
      return -1
    }
    if (a.severity === 'WARNING' && b.severity === 'CRITICAL') {
      return 1
    }
    return 0
});

  const severity = warningsSorted[0]?.severity ?? 'WARNING'
  const message = warningsSorted[0]?.message

  return { severity, message }
}

// Makes a connection attempt.
// It should usually prompt a user's for consent unless a site is already connected.
// Supports [eagerly connection](https://docs.exodus.com/api-reference/solana-provider-api#eagerly-connecting) if 'onlyIfTrusted' is true.
export async function connect(
  deps: BaseConnectDependencies,
  network: string,
  onlyIfTrusted = false,
  silent = false,
): Promise<void> {
  const {
    approveConnection,
    ensureTrusted,
    ensureUnlocked = async () => true,
    isTrusted,
    scanDomains,
    getOrigin,
    getPathname,
  } = deps

  const trusted = await isTrusted()
  const { status: scanStatus, scanResult } =
    await getAreDomainsPotentiallyUnsecure({
      scanDomains,
      domains: [getOrigin() + `${getPathname ? getPathname() : ''}`],
    })
  const shouldTriggerApproveConnection =
    !trusted || scanStatus === DomainStatusEnum.UNSECURE

  if (shouldTriggerApproveConnection) {
    if (onlyIfTrusted) {
      throw new UserRejectedRequestError()
    }

    const approved = await approveConnection(network, scanResult)
    if (!approved) {
      // Cardano needs a different error message for this case.
      if (network === 'cardano') {
        throw new UserDeclinedError()
      }

      throw new UserRejectedRequestError()
    }

    await ensureTrusted(network)
  }

  if (onlyIfTrusted && silent) {
    // onlyIfTrusted is used for an eager connection without user approval and should work when locked
    return
  }

  const unlocked = await ensureUnlocked()
  if (!unlocked) {
    throw new UserRejectedRequestError()
  }
}
