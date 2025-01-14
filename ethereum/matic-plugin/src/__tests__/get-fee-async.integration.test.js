import { getPrivateSeed, walletTester } from '@exodus/assets-testing'

import assetPlugin from '../index.js'

describe('matic async fees for nfts', () => {
  walletTester({
    assetPlugin,
    assetName: 'matic',
    seed: getPrivateSeed(),
    tests: {
      'get fee for nft 1155': async ({ asset }) => {
        const nft = {
          id: 'polygon:0xbb42bf5aebbbeaef9335d8b497fb2cff2a010eed/1',
          contractAddress: '0xbb42bf5aebbbeaef9335d8b497fb2cff2a010eed',
          tokenId: '1',
          contractType: 'erc1155',
        }
        const fromAddress = '0x464F62159e067a8C231b5c3F9A7144E191750051'
        const toAddress = '0x464F62159e067a8C231b5c3F9A7144E191750051'

        const response = await asset.api.getFeeAsync({ asset, nft, fromAddress, toAddress })
        asset.server.stop()
        expect(response).toEqual({
          gasLimit: expect.any(Number),
          extraFeeData: {},
          fee: expect.any(Object),
          gasPrice: asset.currency.parse('135 Gwei'),
        })
      },

      'get fee for nft 721': async ({ asset }) => {
        const nft = {
          id: 'polygon:0xbb42bf5aebbbeaef9335d8b497fb2cff2a010eed/1',
          contractAddress: '0xbb42bf5aebbbeaef9335d8b497fb2cff2a010eed',
          tokenId: '1',
          contractType: 'erc721',
        }
        const fromAddress = '0x464F62159e067a8C231b5c3F9A7144E191750051'
        const toAddress = '0x464F62159e067a8C231b5c3F9A7144E191750051'

        const response = await asset.api.getFeeAsync({ asset, nft, fromAddress, toAddress })
        asset.server.stop()
        expect(response).toEqual({
          gasLimit: expect.any(Number),
          extraFeeData: {},
          fee: expect.any(Object),
          gasPrice: asset.currency.parse('135 Gwei'),
        })
      },

      'get fee invalid contract broken': async ({ asset }) => {
        const nft = {
          id: 'polygon:invalid/1',
          contractAddress: 'invalid',
          tokenId: '1',
        }
        const fromAddress = '0x464F62159e067a8C231b5c3F9A7144E191750051'
        const toAddress = '0x464F62159e067a8C231b5c3F9A7144E191750051'

        try {
          await asset.api.getFeeAsync({ asset, nft, fromAddress, toAddress })
          asset.server.stop()
          expect(false).toEqual(true)
        } catch (e) {
          asset.server.stop()
          expect(e.message).toEqual(
            'Cannot fetch gas for matic\n' +
              'ContractType erc1155 nft input 0xf242432a000000000000000000000000464f62159e067a8c231b5c3f9a7144e191750051000000000000000000000000464f62159e067a8c231b5c3f9a7144e1917500510000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000. Bad rpc response: Invalid address\n' +
              'ContractType erc721 nft input 0x42842e0e000000000000000000000000464f62159e067a8c231b5c3f9a7144e191750051000000000000000000000000464f62159e067a8c231b5c3f9a7144e1917500510000000000000000000000000000000000000000000000000000000000000001. Bad rpc response: Invalid address'
          )
        }
      },
    },
  })
})
