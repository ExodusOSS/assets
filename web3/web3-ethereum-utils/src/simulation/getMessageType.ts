/*
  This utility figures out if the supplied message is plaint text to be signed or a structured typed data.
  See for differences:
  - https://docs.metamask.io/wallet/reference/personal_sign/
  - https://docs.metamask.io/wallet/reference/eth_signtypeddata_v4/

  The utility does not make any security checks (e.g. schema validation), it's supposed to be used only for choosing
  a proper payload type for the simulation API.
 */

export const enum MessageTypeEnum {
  'RawMessage', // References to the `eth_sign` RPC method.
  'TypedData', // References to the `eth_signTypedData` RPC method.
  'Unknown',
}

export const getMessageType = (message: string): MessageTypeEnum => {
  if (typeof message !== 'string') {
    return MessageTypeEnum.Unknown
  }

  try {
    JSON.parse(message)
    return MessageTypeEnum.TypedData
  } catch (err) {
    return MessageTypeEnum.RawMessage
  }
}
