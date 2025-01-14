import { Token, U64 } from '../helpers/spl-token.js'
import { PublicKey } from '../vendor/index.js'

export function computeBalance(futureAccountBalance, currentAccountBalance) {
  return new U64(futureAccountBalance).sub(new U64(currentAccountBalance))
}

export function getTransactionSimulationParams(transactionMessage) {
  let indexToProgramIds = transactionMessage.indexToProgramIds
  const config = {
    encoding: 'base64',
    commitment: 'confirmed',
  }

  const accountAddresses = new Set()

  // Get account keys from `staticAccountKeys` if it's a versioned transaction
  // https://solana-labs.github.io/solana-web3.js/classes/Message.html#staticAccountKeys
  if (transactionMessage.staticAccountKeys) {
    transactionMessage.staticAccountKeys.forEach((account) =>
      accountAddresses.add(account.toString())
    )
  } else if (transactionMessage.accountKeys) {
    if (!indexToProgramIds) {
      indexToProgramIds = new Map()
      transactionMessage.instructions.forEach((instruction) =>
        indexToProgramIds.set(
          instruction.programIdIndex,
          transactionMessage.accountKeys[instruction.programIdIndex]
        )
      )
    }

    transactionMessage.accountKeys
      .filter((_, index) => !indexToProgramIds.has(index))
      .forEach((account) => accountAddresses.add(account.toString()))
  } else {
    const programIds = new Set(
      transactionMessage.instructions.map((instruction) => instruction.programId.toString())
    )

    transactionMessage.instructions.forEach((instruction) => {
      instruction.keys.forEach((key) => {
        if (!programIds.has(key.pubkey.toString())) {
          accountAddresses.add(key.pubkey.toString())
        }
      })
    })
  }

  config['accounts'] = {
    encoding: 'base64',
    addresses: [...accountAddresses],
  }

  return {
    config,
    accountAddresses: [...accountAddresses],
  }
}

const isSolAccount = (account) => account === '11111111111111111111111111111111'

export function filterAccountsByOwner(futureAccountsState, accountAddresses, publicKey) {
  const solAccounts = []
  const tokenAccounts = []

  // Shouldn't happen
  if (futureAccountsState.length !== accountAddresses.length) {
    throw new Error('Simulation returning wrong account length')
  }

  futureAccountsState.forEach((futureAccount, index) => {
    try {
      const accountAddress = accountAddresses[index]

      // Check if it's SOL account (not token)
      if (isSolAccount(futureAccount.owner.toString())) {
        if (accountAddress.toString() === publicKey.toString()) {
          solAccounts.push({
            amount: futureAccount.lamports,
            address: publicKey,
          })
        }

        return
      }

      const data = Buffer.from(futureAccount.data[0], 'base64')
      const token = Token.decode(data)
      const owner = new PublicKey(token.owner).toString()
      const amount = U64.fromBuffer(token.amount)

      // Get tokens by owner using the public key
      if (owner === publicKey.toString()) {
        tokenAccounts.push({
          amount,
          mint: new PublicKey(token.mint).toString(),
          owner,
          address: accountAddress.toString(),
        })
      }
    } catch (error) {
      console.warn(error)
    }
  })

  return {
    solAccounts,
    tokenAccounts,
  }
}
