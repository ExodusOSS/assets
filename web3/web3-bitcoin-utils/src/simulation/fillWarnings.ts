/**
 * This utility adds warning messages in `displayDetails.warnings`, which can be displayed in the UI.
 **/

import type {
  BtcAggregatedTransactionSimulationResult,
  IndexToAddressRecord,
} from '../types.js'

export function fillWarnings({
  indexToAddressRecord,
  simulationResult,
}: {
  indexToAddressRecord: IndexToAddressRecord
  simulationResult: BtcAggregatedTransactionSimulationResult
}): void {
  const UNSAFE_SIGHASHES = [0x02, 0x82]

  const hasSighashNone = Object.values(indexToAddressRecord).some(
    ({ sigHash }) => UNSAFE_SIGHASHES.includes(sigHash),
  )

  if (hasSighashNone) {
    simulationResult.displayDetails!.warnings = [
      `Dangerous sighash detected - SIGHASH_NONE`,
    ]
  }
}
