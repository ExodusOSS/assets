import type { MessageSimulationResult } from '@exodus/web3-types'
import { tryParsingSIWE } from '@exodus/web3-utils'
import assert from 'minimalistic-assert'

import type { SolanaSimulateMessageParams } from './types.js'

export const createSimulateMessage =
  () =>
  async ({
    address,
    asset,
    message,
    url,
  }: SolanaSimulateMessageParams): Promise<MessageSimulationResult> => {
    assert(url instanceof URL, "'url' should be an instance of the URL object.")

    const simulationResult: MessageSimulationResult = {
      baseAssetName: asset.baseAssetName,
      action: 'NONE',
    }

    tryParsingSIWE({
      address,
      message,
      simulationResult,
      url,
    })

    return simulationResult
  }
