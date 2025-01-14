/*
  This utility deserializes the given base64 encoded PSBT into a PSBT instance class.

  Throws if a transaction is invalid or any of the sanity checks did not pass.
 */
import { Psbt } from '@exodus/bitcoinjs'

import type { IndexToAddressRecord } from '../types.js'

export class InvalidPSBTError extends Error {
  constructor(message: string) {
    super()

    this.message = message
  }
}

export function deserializeAndSanityCheckPSBT(
  psbtBase64: string,
  indexToAddressRecord: IndexToAddressRecord,
) {
  let psbt

  try {
    psbt = Psbt.fromBase64(psbtBase64)
  } catch (err: unknown) {
    throw new InvalidPSBTError((err as Error).message)
  }

  // A dApp could mistakenly request to sign a non-existing input number.
  for (const inputNumber in indexToAddressRecord) {
    if (psbt.inputCount < parseInt(inputNumber, 10)) {
      throw new InvalidPSBTError(`The PSBT does not have input#${inputNumber}`)
    }
  }

  return psbt
}
