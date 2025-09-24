import { makeSimulationAPICall } from '@exodus/web3-utils'

import { BLOWFISH_EVM_CHAINS } from './common.js'
import { MessageTypeEnum } from './getMessageType.js'

import type { SimulateMessageParams } from '../types.js'
import type {
  MessageSimulationResult,
  ScanMessageEvmRequest,
  ScanMessageEvm200Response,
} from '@exodus/web3-types'
import type { MessageScanAPICallParams } from '@exodus/web3-utils'

const convertToAPIPayload = ({
  address,
  message,
  url,
}: Pick<
  SimulateMessageParams,
  'address' | 'message' | 'url'
>): ScanMessageEvmRequest => {
  const restParameters = {
    metadata: { origin: url.href },
    userAccount: address,
  }

  if (message.messageType === MessageTypeEnum.TypedData) {
    const kind = 'SIGN_TYPED_DATA'

    return {
      message: {
        kind,
        data: JSON.parse(message.message),
      },
      ...restParameters,
    }
  }

  const kind = 'SIGN_MESSAGE'

  return {
    message: {
      kind,
      rawMessage: message.message,
    },
    ...restParameters,
  }
}

export const handleActionResponse = ({
  simulationResult,
  response,
}: {
  simulationResult: MessageSimulationResult
  response: ScanMessageEvm200Response
}) => {
  if (['BLOCK', 'WARN'].includes(response.action)) {
    simulationResult.action = response.action
  }
}

export const simulateMessage = async ({
  address,
  apiEndpoint,
  message,
  url,
  headers,
  simulationResult,
}: SimulateMessageParams): Promise<void> => {
  const { network, chain } = BLOWFISH_EVM_CHAINS[simulationResult.baseAssetName]

  const payload = convertToAPIPayload({ address, message, url })!

  const response = await makeSimulationAPICall<
    MessageScanAPICallParams,
    ScanMessageEvm200Response
  >({
    url: apiEndpoint,
    chain,
    network,
    payload,
    headers,
  })

  if (!response) {
    return
  }

  handleActionResponse({ simulationResult, response })
}
