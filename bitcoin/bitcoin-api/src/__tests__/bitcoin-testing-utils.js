import { readdirSync } from 'fs'
import lodash from 'lodash'
import { join } from 'path'

const { mapValues } = lodash

export const collectUtxos = (utxos) => {
  return (
    utxos && {
      addresses: utxos.addresses.toArray().map((t) => t.toString()),
      size: utxos.toArray().length,
    }
  )
}

export const collectResults = async ({ asset, aci }) => {
  const assetName = asset.name

  const walletAccounts = await aci.getWalletAccounts({ assetName })

  const results = {}
  for (const walletAccount of walletAccounts) {
    const accountState = await aci.getAccountState({
      assetName,
      walletAccount,
    })
    const txLog = await aci.getTxLog({ assetName, walletAccount })
    const chains = await aci.getUnusedAddressIndexes({ assetName, walletAccount })

    const balance =
      asset.api.getBalances({ asset, accountState, txLog })?.balance || asset.currency.ZERO
    const result = {
      balance: balance.toDefaultString({ unit: true }),
      txs: { size: txLog.size },
      utxos: collectUtxos(accountState.utxos),
      ordinalsUtxos: collectUtxos(accountState.ordinalsUtxos),
      chains,
    }
    results[walletAccount] = result
  }

  return results
}

export const collectUnusedAddressIndexes = async ({ asset, walletAccounts, addressProvider }) => {
  const walletAccountInstances = walletAccounts.getAll()
  // BE strategy, resolving unusedAddressIndexes from the TXLOG
  return Object.fromEntries(
    await Promise.all(
      Object.entries(walletAccountInstances).map(async ([key, walletAccount]) => [
        key,
        await addressProvider.getUnusedAddressIndexes({
          assetName: asset.name,
          walletAccount,
        }),
      ])
    )
  )
}

export const collectBalances = async ({ getBalances, useDefaultUnit }) => {
  const { balances } = await getBalances()

  return mapValues(balances, (walletData) =>
    mapValues(walletData, (assetData) =>
      mapValues(assetData, (balance) =>
        useDefaultUnit
          ? balance?.toDefaultString({ unit: true })
          : balance?.toBaseString({ unit: true }) || null
      )
    )
  )
}

export const createSignTestCases = ({ fixturesPath, fixturesRequire }) => {
  const fixturesImport = (name) => import(join(fixturesPath, name))
  // When require() is present, use fixturesRequire as a loader for bundle compatibility
  const load = fixturesRequire && typeof require !== 'undefined' ? fixturesRequire : fixturesImport
  const unsignedTxTestCases = Object.fromEntries(
    readdirSync(fixturesPath).map((file) => [file, load(file)])
  )
  return mapValues(
    unsignedTxTestCases,
    (testCasePromise) =>
      async ({ asset, transactionSigner, walletAccountsAtom }) => {
        const { default: testCase } = await testCasePromise
        const walletAccounts = await walletAccountsAtom.get()
        const walletAccount = walletAccounts[`exodus_${testCase.accountIndex}`]
        const result = await transactionSigner.signTransaction({
          assetName: asset.name,
          baseAssetName: asset.baseAsset.name,
          unsignedTx: testCase.unsignedTx,
          walletAccount,
        })
        expect(result.txId).toEqual(testCase.txId)
        expect(result.rawTx.toString('hex')).toEqual(testCase.rawTx)
      }
  )
}
