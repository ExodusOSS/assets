import assetPlugin from '../index.js'

jest.setTimeout(30_000)

const asset = assetPlugin.createAsset({ assetClientInterface: {} })

afterAll(() => {
  asset.server.dispose?.()
})

describe('Base Gas', () => {
  it('estimates a normal transfer', async () => {
    // eslint-disable-next-line @exodus/import/no-deprecated
    const response = await asset.estimateL1DataFee({
      unsignedTx: {
        txData: {
          chainId: asset.chainId,
          data: Buffer.alloc(0),
          nonce: new Uint8Array([31]),
          gasLimit: new Uint8Array([178, 231]),
          gasPrice: new Uint8Array([152, 150, 128]),
          to: '0xc0e9573c1168a7a4198A0f63Ac70fD8F62b291D0',
          value: new Uint8Array([3, 141, 126, 164, 198, 128, 0]),
        },
        txMeta: {
          assetName: 'optimism',
          eip1559Enabled: false,
        },
      },
    })
    const number = parseInt(response)
    expect(number).toBeGreaterThan(0)
  })
})
