import assetPlugin from '../index.js'
import taproot from './fixtures/sign/taproot-unsigned-tx.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const mockHardwareDevice = {
  signTransaction: jest.fn(),
}

const bitcoin = assetPlugin.createAsset({ assetClientInterface })

describe('sign with  hardware wallet', () => {
  it('should sign SegwitV0 & Taproot', async () => {
    mockHardwareDevice.signTransaction.mockResolvedValue([
      {
        inputIndex: 0,
        publicKey: Buffer.from(
          '03822f479dce9d7880edb4dd486732336603286d43ae6db4e04599d673a9380931',
          'hex'
        ),
        signature: Buffer.from(
          '30450221009a70dd5b0beeafc0307dc25441dd9db9397c126c469fac67bd9e50a79fa0d81502207496a161a77cd0a56ef04be6e289af1003375a8dd02cadac9f87839b9e77e35a01',
          'hex'
        ),
      },
      {
        inputIndex: 1,
        publicKey: Buffer.from(
          '3d5347b3d2a03ebb906fb0913630c2058f24c2d3ddd4d7eed722c3416e2094cd',
          'hex'
        ),
        signature: Buffer.from(
          'c4d1a3e0d129de30a5d4c487a7b44da3dbe472386ee946df878baaac99357d0ae70c7ad90eb6c809c1f32e256ceb6e758e6ff3b3d1f6f7472c14c207c23d8d32',
          'hex'
        ),
      },
    ])

    const signedTransaction = await bitcoin.api.signHardware({
      unsignedTx: taproot.unsignedTx,
      hardwareDevice: mockHardwareDevice,
      accountIndex: taproot.accountIndex,
    })

    expect(mockHardwareDevice.signTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        assetName: 'bitcoin',
        derivationPaths: ["m/86'/0'/1'/0/0", "m/84'/0'/1'/1/2"],
      })
    )
    expect(signedTransaction).toBeDefined()
    expect(signedTransaction.rawTx.toString('hex')).toBe(taproot.rawTx)
    expect(signedTransaction.txId).toBe(taproot.txId)
  })
})
