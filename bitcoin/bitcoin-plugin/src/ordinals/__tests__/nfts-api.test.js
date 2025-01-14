import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import path from 'path'

import { xverse49 } from '../../compatibility-modes.js'
import assetPlugin from '../../index.js'

const config = { ordinalChainIndex: 2, ordinalsEnabled: true }

const beforeSafeReportFile = path.join(
  import.meta.dirname,
  './monitor-ordinals-enabled-safe-report.json'
)

describe(`bitcoin.nfts enabled can update utxos`, () => {
  walletTester({
    assetPlugin,
    assetConfig: config,
    seed: getPrivateSeed(),
    walletAccountCount: 2,
    compatibilityMode: xverse49,
    importSafeReportFile: beforeSafeReportFile,
    tests: {
      'load all nfts from proxy server': async ({
        assetClientInterface,
        asset,
        walletAccountsAtom,
      }) => {
        const walletAccount = 'exodus_1'

        const walletAccounts = await walletAccountsAtom.get()

        const walletAccountInstance = walletAccounts[walletAccount]

        const addresses = await asset.api.nfts.getNftsAddresses({
          assetClientInterface,
          walletAccount: walletAccountInstance,
        })
        expect(addresses).toEqual([
          'bc1pe59l2tsfe6t5x6wrcgtsaxy3nrpnky8chq4cvf7zndat99f8t4xsetgm4w',
          'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
          '3EkvexGVww1FoG8gWemkxK6GPnmTxvW3Bg',
        ])
        const nfts = [
          {
            network: 'bitcoin',
            attributes: [],
            collectionName: 'No Collection',
            image:
              'https://fetch-n-cache.a.exodus.io/?url=https%3A%2F%2Ford-mirror.magiceden.dev%2Fcontent%2F45199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0&maxage=2678400&apikey=nftproxy_zDKMFoRw6e8xrWCmXNccium43xLz4xxt9vWNBCfHMr',
            name: '#7010622',
            number: 7_010_622,
            owner: 'bc1pe59l2tsfe6t5x6wrcgtsaxy3nrpnky8chq4cvf7zndat99f8t4xsetgm4w',
            id: 'bitcoin:45199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
            tokenId: '45199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
            contentType: 'text/plain;charset=utf-8',
            output: 'fad4bdad739a21e409b5d3e0c3a9d5fb1ac188cd1ec9b172ee8912dde7063c91:0',
            inscriptionNumber: 7_010_622,
            sending: false,
            receiving: false,
          },
          {
            network: 'bitcoin',
            attributes: [],
            collectionName: 'No Collection',
            number: 7_010_623,
            owner: 'bc1qpk5g380fe5u0tfd8gz9h3lsga402q49kf2c5ny',
            id: 'bitcoin:11199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
            tokenId: '11199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
            contentType: 'text/plain;charset=utf-8',
            output: 'd2627ebefccc448fea0dfaa8e8b365f3d96f3fc32c0551ed539f4329312e54ad:1',
            inscriptionNumber: 7_010_622,
            sending: false,
            receiving: false,
          },
          {
            network: 'bitcoin',
            attributes: [],
            collectionName: 'No Collection',
            number: 7_010_624,
            owner: 'bc1qpk5g380fe5u0tfd8gz9h3lsga402q49kf2c5ny',
            id: 'bitcoin:22299d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
            tokenId: '22299d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
            contentType: 'text/plain;charset=utf-8',
            output: '1111ebefccc448fea0dfaa8e8b365f3d96f3fc32c0551ed539f4329312e54ad:1', // Utxos is not in the list! AKA Ordinal NFTs in transit out
            inscriptionNumber: 7_010_622,
            sending: true,
            receiving: false,
          },
        ]

        const postProcessedNfts = await asset.api.nfts.postProcessNfts({ nfts, walletAccount })
        expect(postProcessedNfts).toEqual(nfts)

        const accountState = await assetClientInterface.getAccountState({
          assetName: asset.name,
          walletAccount,
        })

        const expectedAditionalInscriptions = [
          {
            inscriptionId: '45199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
            txId: 'fad4bdad739a21e409b5d3e0c3a9d5fb1ac188cd1ec9b172ee8912dde7063c91',
            vout: 0,
          },
        ]

        expect(accountState.additionalInscriptions).toEqual(expectedAditionalInscriptions)

        const postProcessedNftsAgain = await asset.api.nfts.postProcessNfts({ nfts, walletAccount })
        expect(postProcessedNftsAgain).toEqual(nfts)

        const accountStateAgain = await assetClientInterface.getAccountState({
          assetName: asset.name,
          walletAccount,
        })

        expect(accountStateAgain.additionalInscriptions).toEqual(expectedAditionalInscriptions)
      },

      'must avoid utxos': async ({ assetClientInterface, asset }) => {
        const walletAccount = 'exodus_0'

        // forcing setting up aci in nfts
        asset.api.createHistoryMonitor({ asset, assetClientInterface })

        const beforeAccountState = await assetClientInterface.getAccountState({
          assetName: asset.name,
          walletAccount,
        })

        expect(beforeAccountState.utxos.toArray().length).toEqual(1)
        expect(beforeAccountState.ordinalsUtxos.toArray().length).toEqual(3)
        expect(beforeAccountState.mustAvoidUtxoIds).toEqual([])

        await asset.api.nfts.addMustAvoidUtxoIds({
          walletAccount,
          mustAvoidUtxoIds: [
            'bd6abad81417d362de666d92f885f9ce6a11386af876ccc6e755dd7ecd3f093a:0', // moves utxo from utxos to ordinalUtos
            'notExist:0',
            'another:0',
          ],
        })

        const afterAccountState = await assetClientInterface.getAccountState({
          assetName: asset.name,
          walletAccount,
        })
        expect(afterAccountState.utxos.toArray().length).toEqual(1)
        expect(afterAccountState.ordinalsUtxos.toArray().length).toEqual(3)
        expect(afterAccountState.mustAvoidUtxoIds).toEqual([
          'another:0',
          'bd6abad81417d362de666d92f885f9ce6a11386af876ccc6e755dd7ecd3f093a:0',
          'notExist:0',
        ])

        await asset.api.nfts.addMustAvoidUtxoIds({
          walletAccount,
          mustAvoidUtxoIds: ['notExist:0'],
        }) // no op

        const afterAccountStateNoModification = await assetClientInterface.getAccountState({
          assetName: asset.name,
          walletAccount,
        })
        expect(afterAccountStateNoModification.utxos.toArray().length).toEqual(1)
        expect(afterAccountStateNoModification.ordinalsUtxos.toArray().length).toEqual(3)
        expect(afterAccountStateNoModification.mustAvoidUtxoIds).toEqual([
          'another:0',
          'bd6abad81417d362de666d92f885f9ce6a11386af876ccc6e755dd7ecd3f093a:0',
          'notExist:0',
        ])

        await asset.api.nfts.addMustAvoidUtxoIds({
          walletAccount,
          mustAvoidUtxoIds: ['notExist:0'],
          prune: true,
        }) // no op

        const afterPruneAccountState = await assetClientInterface.getAccountState({
          assetName: asset.name,
          walletAccount,
        })
        expect(afterPruneAccountState.utxos.toArray().length).toEqual(1)
        expect(afterPruneAccountState.ordinalsUtxos.toArray().length).toEqual(3)
        expect(afterPruneAccountState.mustAvoidUtxoIds).toEqual([])
      },
    },
  })
})
