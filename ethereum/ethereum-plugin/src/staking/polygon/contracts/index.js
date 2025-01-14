export const mainnetContracts = {
  VALIDATOR_SHARES_CONTRACT_ADDR: '0xf30cf4ed712d3734161fdaab5b1dbb49fd2d0e5c',
  STAKING_MANAGER_ADDR: '0x5e3ef299fddf15eaa0432e6e66473ace8c13d908',
  TOKEN_CONTRACT: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
}

export const methodIds = {
  DELEGATE: '0x6ab15071', // buyVoucher(uint256 _amount, uint256 _minSharesToMint)
  UNDELEGATE: '0xc83ec04d', // sellVoucher_new(uint256 claimAmount, uint256 maximumSharesToBurn)
  CLAIM_REWARD: '0xc7b8981c', // withdrawRewards()
  CLAIM_UNDELEGATE: '0xe97fddc2', // unstakeClaimTokens_new(uint256 unbondNonce)
}
