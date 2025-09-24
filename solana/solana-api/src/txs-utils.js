const TRANSFER_INSTRUCTION_TYPES = new Set([
  'transfer',
  'transferChecked',
  'transferCheckedWithFee',
])

const MINT_INSTRUCTION_TYPES = new Set(['mintTo', 'mintToChecked'])

const isSolanaTx = (tx) => tx.coinName === 'solana'
export const isSolanaStaking = (tx) =>
  isSolanaTx(tx) && ['createAccountWithSeed', 'delegate'].includes(tx?.data?.staking?.method)
export const isSolanaUnstaking = (tx) =>
  isSolanaTx(tx) && tx?.data?.staking?.method === 'undelegate'
export const isSolanaWithdrawn = (tx) => isSolanaTx(tx) && tx?.data?.staking?.method === 'withdraw'
export const isSolanaRewardsActivityTx = (tx) =>
  [isSolanaStaking, isSolanaUnstaking, isSolanaWithdrawn].some((fn) => fn(tx))

export const isSplTransferInstruction = ({ program, type }) =>
  program === 'spl-token' && TRANSFER_INSTRUCTION_TYPES.has(type)

export const isSolTransferInstruction = ({ program, type }) =>
  program === 'system' && TRANSFER_INSTRUCTION_TYPES.has(type)

export const isSplMintInstruction = ({ program, type }) =>
  program === 'spl-token' && MINT_INSTRUCTION_TYPES.has(type)
