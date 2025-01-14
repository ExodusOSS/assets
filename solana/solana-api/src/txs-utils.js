const TRANSFER_INSTRUCTION_TYPES = new Set([
  'transfer',
  'transferChecked',
  'transferCheckedWithFee',
])

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
