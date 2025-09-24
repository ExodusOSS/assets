import { InvalidInputError } from '@exodus/web3-errors'

import { parseAndValidateTypedData as _parseAndValidateTypedData } from './validator.js'

import type {
  MessageTypes,
  TypedDataV1,
  TypedMessage,
} from '@exodus/ethereumjs/eth-sig-util'
import type { MessageTypeProperty } from '@exodus/ethereumjs/eth-sig-util'

export function convertChainIdToHex(chainId: string): string {
  if (typeof chainId !== 'string') {
    throw new Error(`'chainId' should be a string, got: ${typeof chainId}`)
  }

  // `chainId` can be a stringified decimal
  if (!chainId.startsWith('0x')) {
    return '0x' + parseInt(chainId, 10).toString(16).toLowerCase()
  }

  return chainId.toLowerCase()
}

// Returns the parsed typed data object if it is valid
// Otherwise throws the InvalidInputError
export function parseAndValidateTypedData(
  typedData: string,
  { chainId: activeChainId }: { chainId: string },
): TypedDataV1 | TypedMessage<MessageTypes> | never {
  let parsedTypedData: TypedMessage<MessageTypes>

  try {
    parsedTypedData = _parseAndValidateTypedData(
      typedData,
    ) as TypedMessage<MessageTypes>
  } catch (e) {
    throw new InvalidInputError()
  }

  // Security: checking if the 'message' property includes fields that don't belong to the primary type.
  if (
    !Object.hasOwnProperty.call(
      parsedTypedData.types,
      parsedTypedData.primaryType,
    )
  ) {
    throw new InvalidInputError(
      `'message' property includes fields that don't belong to the primary type`,
    )
  }

  const allowedFieldsSet = new Set(
    parsedTypedData.types[parsedTypedData.primaryType].map(
      ({ name }: MessageTypeProperty) => name,
    ),
  )

  // Handle cases where the message includes fields that doesn't belong to the primary type.
  const isFieldExempted = (field: string) => {
    // Handle OpenSea case. See: https://github.com/status-im/status-mobile/issues/13769
    if (
      field === 'totalOriginalConsiderationItems' &&
      parsedTypedData.primaryType === 'OrderComponents' &&
      parsedTypedData.message['consideration']
    ) {
      return true
    }

    return false
  }

  for (const field in parsedTypedData.message) {
    if (!allowedFieldsSet.has(field) && !isFieldExempted(field)) {
      throw new InvalidInputError(
        `field '${field}' is not defined in the primary type definition`,
      )
    }
  }

  // Security: checking if the requested chain matches the active chain ID.
  if (parsedTypedData?.domain?.chainId) {
    const suppliedChainIdHex = convertChainIdToHex(
      `${parsedTypedData.domain.chainId}`,
    )

    if (activeChainId.toLowerCase() !== suppliedChainIdHex) {
      throw new InvalidInputError(
        `chainId supplied in typed data does not match active chainId`,
      )
    }
  }

  return parsedTypedData
}
