import { runVectorTests } from '@exodus/assets-testing'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface } from './utils/assetClientInterface.js'

const asset = assetPlugin.createAsset({ assetClientInterface: dummyAssetClientInterface })

const vectors = {
  versions: {
    bech32: 'bcrt',
    p2pkh: 111,
    p2sh: 196,
    segwit: 'bcrt1q',
    taproot: 'bcrt1p',
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
      '_0x5120ca032b3575ddf2693956a16597650c5335f366dd0ba49d42decf33f7c593ba6c',
    ],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', '_0x76a914653eb948cf07ac5cb15180c6bbf06393ebb935fe88ac'],
  ],

  fromScriptPubKey: [
    ['_0x76a914653eb948cf07ac5cb15180c6bbf06393ebb935fe88ac', 'mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA'],
    [
      '_0x0014418513e06dea9fbf8f3557888c891cd7ac060123',
      'bcrt1qgxz38crda20mlre427ygezgu67kqvqfracmrgf',
    ],
  ],

  isP2TR: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', false],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', false],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', false],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', false],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', false],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', false],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', true],
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
    ['bcrt1qy37qlxz9qm79npsq5s7ywcwl3q87ehftcyma6g', true],
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
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', true],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', true],
    ['invalid', false],
  ],

  resolvePurpose: [
    ['2N2LNsPC7xUxmbqbiQPiMLCVkiQjfkPfjuv', 49],
    ['2NGGQidVyRg7MvrEWcLc9Rs1xkTSn3MJeH8', 49], // should it be 141 according to https://iancoleman.io?
    ['mv9rcNvSbmjFrgwuL3NqbphGfPzYfuSpMC', 44],
    ['mpxSHEZb3Xqh7mpAXRaE56H2FT5HpPNHMT', 44],
    ['mtkyAZsnWgswGa9bVu2zaABcyfSVUrXjdM', 44],
    ['bcrt1qfg8ashdflwgukngfmmw2xkm93mpjl9hh8ka274', 84],
    ['bcrt1q8lv4jc9ywsk67qa28g0jyx5dc34n9uyqkx043w', 84],
    ['bcrt1qsqxa7qyg6nxaw7mju0h6yn798n2hrt24gdvdec', 84],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', 86],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', undefined], // bitcoin mainnet, not valid
    ['invalid', undefined],
  ],
}

const api = `address`
describe(`${asset.name} ${api} vector tests`, () => {
  runVectorTests({ asset, vectors, api })
})
