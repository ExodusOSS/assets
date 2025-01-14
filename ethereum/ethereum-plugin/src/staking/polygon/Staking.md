## Staking in Polygon (MATIC)

## How it works?

Polygon Staking happens in the **Ethereum network**, it is implemented by a set of smart contracts deployed on the ETH mainnet.
Staking is made by delegating the `ERC20 MATIC` token to those smart contracts which handle the `(un)staking/rewards` process and it shouldn't be confused with the Native asset in **Polygon network** (`MATIC NATIVE`).

Stakers are divided into `validators`, `delegators`, and watchers (for fraud reporting).

## Contracts

### StakeManager contract

`StakeManager` is the main contract for handling validator related activities like checkPoint signature verification, reward distribution, and stake management. Since the contract is using NFT ID as a source of ownership, change of ownership and signer won't affect anything in the system. [see](https://wiki.polygon.technology/docs/pos/contracts/stakingmanager).

### ValidatorShare contract

For delegation staking each validator has its own deployed **contract**, this contract has the logic to `stake/unstake` as delegators, but it also acts as an `ERC20`, this `ERC20` token is what we know as the shares token. Shares token are calculated based on the total amount staked in the contract, varying from time to time
When delegators stake matic, they call `buyVoucher()` , the contract receives the MATIC tokens to stake (approval is needed on Matic token contract) and it calculates and mints the number of token shares that correspond to that staked amount. [see](https://wiki.polygon.technology/docs/pos/contracts/delegation).

### Staking Anatomy

Example taken from the docs:

_Polygon supports delegation via validator shares. By using this design, it is easier to distribute rewards and slash with scale (thousands of delegators) on Ethereum contracts without much computation.
Delegators delegate by purchasing shares of a finite pool from validators. Each validator will have their own validator share token. Let's call these fungible tokens `VATIC` for a validator `A`. As soon as a user delegates to a validator `A`, they will be issued `VATIC` based on an exchange rate of `MATIC/VATIC` pair. As users accrue value the exchange rate indicates that they can now withdraw more `MATIC` for each `VATIC` and when users get slashed, users withdraw less `MATIC` for their `VATIC`.
Note that `MATIC` is a staking token. A delegator needs to have `MATIC` tokens to participate in the delegation.
Initially, a delegator `D` buys tokens from validator `A` specific pool when `1 MATIC per 1 VATIC`.
When a validator gets rewarded with more `MATIC` tokens, new tokens are added to the pool. Let's say with the current pool of `100 MATIC` tokens, `10 MATIC` rewards are added to the pool. But since the total supply of `VATIC` tokens didn't change due to rewards, the exchange rate becomes `1 MATIC per 0.9 VATIC`. Now, delegator `D` gets more `MATIC` for the same shares.
`VATIC`: Validator specific minted validator share tokens (ERC20 tokens)_

#### Rewards

Delegators can do with their rewards the following:
withdraw via `withdrawRewards()` or
`restake` (earned rewards are put as stake in the contract via `restake()`)

#### Unstaking

For delegators to unstake, there are two steps:

1. `sellVoucher_new()`
2. `unstakeClaimTokens()`

**Note**: there are some methods in the validator share contract with the suffix `_new`, for instance:
`sellVoucher()` and `sellVoucher_new()` this is because the recent changes on the smart contract to support the new exit API (**unstake** and **claim** tokens)\*

**sellVoucher** method calculates the token shares that correspond to the staked MATIC at that time, and burns those share tokens, it also transfers the rewards, and makes changes in the contract to update the total stake held in the contract .
Basically it prepares the contract to let delegators withdraw their staked MATIC in a second step once the **withdrawal delay** it's ben fulfilled.

#### Unstake Claim Tokens

**unstakeClaimTokens** makes the actual withdraw of the staked tokens, sellVoucher does not transfer the staked MATIC back to the delegator, we need to call this function after the withdrawal delay has been fulfilled, so that delegators can get their stake amount back to their wallet.

### Staking Bussines Rules

All of these rules can be queried from the smart contracts, except `minimum amount to stake`, this is defined by Exodus.

- **Minimum rewards to withdraw**: 1 MATIC (contract rule)
- **Minimum amount to stake**: 1 MATIC (exodus rule)
- **Withdrawal delay**: The amount of time delegators must wait before claiming their staked amount. Varies depending on the contract governance
- **Withdrawal exchange rate**: The exchange rate used to convert tokens to shares and vice-versa. Varies depending on the number of MATIC in the withdraw pool share (affected by the earned rewards).
- **Unstaking period**: immediately, but staked MATIC tokens are not available to be withdrawn before withdrawal delay
- **Claim unstaked tokens**: after 3-4 days has passed since unstaked was called, the unstaked tokens can be claimed by the delegator.

Useful resources:

[Polygon docs](https://wiki.polygon.technology/docs/pos/polygon-architecture/)
[Polygon Staking](https://wiki.polygon.technology/docs/pos/contracts/delegation)
[StakeManager contract](https://github.com/maticnetwork/contracts/blob/main/contracts/staking/stakeManager/StakeManager.sol)
[Validator share contract](https://github.com/maticnetwork/contracts/blob/main/contracts/staking/stakeManager/StakeManager.sol)
