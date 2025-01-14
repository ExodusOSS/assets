import { runVectorTests } from '@exodus/assets-testing'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface } from './utils/assetClientInterface.js'

const asset = assetPlugin.createAsset({ assetClientInterface: dummyAssetClientInterface })

const vectors = {
  versions: {
    bech32: 'tb',
    p2pkh: 111,
    p2sh: 196,
    segwit: 'tb1q',
    taproot: 'tb1p',
  },

  toScriptPubKey: [
    [
      'bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu',
      new Error('bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu has an invalid prefix'),
    ],
    [
      'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
      new Error('bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn has an invalid prefix'),
    ],
    [
      'bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7',
      new Error(
        'bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7 has an invalid prefix'
      ),
    ],
    [
      'tb1qeghfha5yjp3ytf322zhsknyj44rudupaeufsqe',
      '_0x0014ca2e9bf684906245a62a50af0b4c92ad47c6f03d',
    ],
    [
      'tb1pcpqut9w2zperwm7y3s9uegddrm0008ch9rz8grpuw0megg2cv9wq2zfpjr',
      '_0x5120c041c595ca1072376fc48c0bcca1ad1edef79f1728c4740c3c73f7942158615c',
    ],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', '_0x76a914653eb948cf07ac5cb15180c6bbf06393ebb935fe88ac'],
  ],

  fromScriptPubKey: [
    [
      '_0x0014ca2e9bf684906245a62a50af0b4c92ad47c6f03d',
      'tb1qeghfha5yjp3ytf322zhsknyj44rudupaeufsqe',
    ],
    ['0014ca2e9bf684906245a62a50af0b4c92ad47c6f03d', 'tb1qeghfha5yjp3ytf322zhsknyj44rudupaeufsqe'],
    ['_0x76a914653eb948cf07ac5cb15180c6bbf06393ebb935fe88ac', 'mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA'],
    ['_0x76a914653eb948cf07ac5cb15180c6bbf06393ebb935fe88ac', 'mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA'],
    [
      '_0x0014418513e06dea9fbf8f3557888c891cd7ac060123',
      'tb1qgxz38crda20mlre427ygezgu67kqvqfrl3zwlq',
    ],
  ],

  isP2TR: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', false],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', false],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', false],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', false],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', false],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', false],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', true],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', false],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', false],
    ['invalid', false],
  ],

  isP2PKH: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', false],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', false],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', false],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', false],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', false],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', false],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', false],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', true],
    ['invalid', false],
  ],

  isP2SH: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', false],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', false],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', false],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', false],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', false],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', false],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', false],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', false],
    ['invalid', false],
  ],

  isP2WPKH: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', false],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', false],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', false],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', false],
    ['bcrt1qy37qlxz9qm79npsq5s7ywcwl3q87ehftcyma6g', false],
    ['tb1qeghfha5yjp3ytf322zhsknyj44rudupaeufsqe', true],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', false],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', false],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', false],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', false],
    ['invalid', false],
  ],

  isP2WSH: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', false],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', false],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', false],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', false],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', false],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', false],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', false],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', false],
    ['invalid', false],
  ],
  validate: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', false],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', false],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', false],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', false],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', false],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', false],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', true],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', false],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', true],
    ['invalid', false],
  ],

  resolvePurpose: [
    ['2NGU4yBChQUkpT1rn1KMrry8USzX8LSmYTN', 49],
    ['2N1PDj1CQEtAxJWvAwLoFdGwUTPJ8q8Jsiy', 49], // should it be 141 according to https://iancoleman.io?
    ['n2LxifEgnrF6edaXTrGtyRhmKStFSawDfX', 44],
    ['mr9oiTr3fQbpJyDag7vif7gCpvWkcoXv32', 44],
    ['tb1qk784w4tfuh5ezqtk3pt6a3tr8vatn6drjqntm0', 84],
    ['tb1qgx0sr4z628rxexwv5lswkprc2rte6092qksfz8', 84],
    ['bcrt1qsqxa7qyg6nxaw7mju0h6yn798n2hrt24gdvdec', undefined], // regtest, not valid
    ['tb1pcpqut9w2zperwm7y3s9uegddrm0008ch9rz8grpuw0megg2cv9wq2zfpjr', 86],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', undefined], // bitcoin mainnet, not valid
    ['invalid', undefined],
  ],
}

const api = `address`
describe(`${asset.name} ${api} vector tests`, () => {
  runVectorTests({ asset, vectors, api })
})
