import { tryParsingSIWE } from '@exodus/web3-utils'
import assert from 'minimalistic-assert'

import { getMessageType, MessageTypeEnum } from './simulation/getMessageType.js'
import { simulateMessage } from './simulation/simulateMessage.js'

import type { EthSimulateMessageParams } from './types.js'
import type { MessageSimulationResult } from '@exodus/web3-types'

export const createSimulateMessage =
  ({
    apiEndpoint = 'https://simulation.a.exodus.io/simulateMessage',
    headers = {
      'X-Api-Version': '2023-06-05',
    },
  } = {}) =>
  async ({
    message,
    url,
    asset,
    address,
  }: EthSimulateMessageParams): Promise<MessageSimulationResult> => {
    assert(url instanceof URL, "'url' should be an instance of the URL object.")

    const simulationResult: MessageSimulationResult = {
      baseAssetName: asset.baseAssetName,
      action: 'NONE',
    }

    const messageType = getMessageType(message)
    if (messageType === MessageTypeEnum.Unknown) {
      return simulationResult
    }

    if (messageType === MessageTypeEnum.RawMessage) {
      tryParsingSIWE({
        address,
        message,
        url,
        simulationResult,
      })
    }

    await simulateMessage({
      address,
      message: {
        message,
        messageType,
      },
      url,
      apiEndpoint,
      headers,
      simulationResult,
    })

    return simulationResult
  }
