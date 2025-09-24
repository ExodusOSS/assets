export const sendTxTest = async ({
  assetClientInterface,
  asset,
  address,
  amount,
  options,
  expectedBalance,
  expectedFee,
  expectedTxData,
}) => {
  const walletAccount = `exodus_${expectedTxData.accountIndex}`

  const expectedUnsignedTx = expectedTxData.unsignedTx
  const expectedTxId = expectedTxData.txId

  const assetName = asset.name
  const accountState = await assetClientInterface.getAccountState({
    assetName,
    walletAccount,
  })
  const txSet = await assetClientInterface.getTxLog({ assetName, walletAccount })
  const feeData = await assetClientInterface.getFeeConfig({ assetName })

  const nft = options.nft

  const { spendable } = asset.api.getBalances({
    asset,
    accountState,
    txLog: txSet,
    feeData,
  })

  const { fee: basicFee } = asset.api.getFee({
    asset,
    accountState,
    txSet,
    feeData,
    isSendAll: options.isSendAll,
  })

  const availableBalance = spendable.sub(basicFee)

  expect(availableBalance.toBaseString({ unit: true })).toEqual(
    expectedBalance.toBaseString({ unit: true })
  )

  const insightClient = asset.insightClient

  if (!jest.isMockFunction(insightClient.broadcastTx)) {
    insightClient.broadcastTx = jest.fn((rawTx) => {
      console.log('Simulating broadcasting of', rawTx)
    })
  }

  expect(insightClient.broadcastTx).not.toBeCalled()
  const toSendBalance = nft ? undefined : amount || availableBalance
  const { fee: calculatedFee, extraFeeData } = asset.api.getFee({
    asset,
    accountState,
    txSet,
    feeData,
    customFee: options.customFee,
    amount: toSendBalance,
    nft,
  })

  expect(
    calculatedFee.sub(extraFeeData?.extraFee || asset.currency.ZERO).toBaseString({ unit: true })
  ).toEqual(expectedFee.toBaseString({ unit: true }))

  if (jest.isMockFunction(insightClient.fetchRawTx)) {
    insightClient.fetchRawTx.mockImplementation(async (txId) => {
      const resolvedTx = expectedUnsignedTx.txMeta?.rawTxs?.find((rawTx) => rawTx.txId === txId)
      expect(resolvedTx).toBeDefined()
      return resolvedTx.rawData
    })
  }

  const result = await asset.api.sendTx({
    asset,
    walletAccount,
    address,
    amount: toSendBalance,
    options,
  })

  expect(insightClient.broadcastTx).toBeCalledTimes(1)
  expect(asset.api.signTx).toBeCalledTimes(1)

  const signTxParams = asset.api.signTx.mock.calls[0][0]
  const { unsignedTx, signer, hdkeys } = signTxParams
  const signedTx = await asset.api.signTx.mock.results[0].value

  expect(unsignedTx).toBeDefined()
  expect(Boolean(signer)).toEqual(!hdkeys)

  const txLogs = await assetClientInterface.getTxLog({ assetName, walletAccount })

  const newAccountState = expectedTxData.newAccountState
    ? await assetClientInterface.getAccountState({
        assetName,
        walletAccount,
      })
    : undefined

  expect(signedTx.txId).toEqual(result.txId)

  const rawTxLog = txLogs.get(result.txId)

  // the stringify => parse is to make the jest comparison friendly
  const txLog = JSON.parse(JSON.stringify(rawTxLog.toJSON()))
  txLog.date = 'SOME DATE'
  const txData = {
    txId: result.txId,
    rawTx: signedTx.rawTx.toString('hex'),
    accountIndex: expectedTxData.accountIndex,
    unsignedTx,
    txLog,
    newAccountState: newAccountState?.toJSON(),
    virtualSize: signedTx.tx.virtualSize,
  }
  expect(txData).toMatchObject(expectedTxData)
  expect(txData).toMatchSnapshot()

  expect(result.txId).toEqual(expectedTxId)

  if (rawTxLog.data.replacedTxId) {
    expect(rawTxLog.feeAmount.toBaseNumber()).toBeGreaterThanOrEqual(expectedFee.toBaseNumber())
  }
  // when there is dust, it goes to the fee rather than change utxo
  else if (rawTxLog.data.changeAddress) {
    expect(rawTxLog.feeAmount.toBaseString({ unit: true })).toEqual(
      expectedFee.toBaseString({ unit: true })
    )
  } else {
    expect(rawTxLog.feeAmount.toBaseNumber()).toBeGreaterThanOrEqual(expectedFee.toBaseNumber())
  }
}
