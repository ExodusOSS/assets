import { runVectorTests } from '@exodus/assets-testing'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const asset = assetPlugin.createAsset({ assetClientInterface })

// ref https://medium.com/fixedfloat/bitcoin-address-formats-3522cf47bdf4

const vectors = {
  versions: {
    bech32: 'bc',
    p2pkh: 0,
    p2sh: 5,
    segwit: 'bc1q',
    taproot: 'bc1p',
  },

  toScriptPubKey: [
    ['38BW8nqpHSWpkf5sXrQd2xYwvnPJwP59ic', '_0xa9144733f37cf4db86fbc2efed2500b4f4e49f31202387'],
    [
      'bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr',
      '_0x0014a65d1a239d4ec666643d350c7bb8fc44d2881128',
    ],
    [
      'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
      '_0x0014418513e06dea9fbf8f3557888c891cd7ac060123',
    ],
    [
      'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
      '_0x5120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f537',
    ],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', '_0x76a914653eb948cf07ac5cb15180c6bbf06393ebb935fe88ac'],
  ],

  fromScriptPubKey: [
    ['_0xa9144733f37cf4db86fbc2efed2500b4f4e49f31202387', '38BW8nqpHSWpkf5sXrQd2xYwvnPJwP59ic'],
    ['0014a65d1a239d4ec666643d350c7bb8fc44d2881128', 'bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr'],
    [
      '_0x0014418513e06dea9fbf8f3557888c891cd7ac060123',
      'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
    ],
  ],

  isP2TR: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', false],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', false],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', false],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', false],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', true],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', false],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
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
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', true],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', false],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', false],
    ['invalid', false],
  ],

  isP2SH: [
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', true],
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
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', true],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', true],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', true],
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
    ['3GRdnTq18LyNveWa1gQJcgp8qEnzijv5vR', true],
    ['bc1qeyf0rhzamhhuc3g6zcrwkll60wtdf5dcr7cxhu', true],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', true],
    ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', true],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', true],
    ['1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3', true],
    ['tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey', false],
    ['bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7', false],
    ['mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA', false],
    ['invalid', false],
  ],

  resolvePurpose: [
    ['3DmniCwza3E1yDeERdSDPBj8M7zySSf1rX', 49],
    ['bc1qz9shxhx79stygv0lwtj3urw5dxd6mhaw7ammeq', 84],
    ['3FZZY1ctriX356WsNNAuRJeVVQTBe9jCrw', 49], // should it be 141 according to https://iancoleman.io?
    ['1Cnc5nktH7WjWy9U4ix7gRmneSU67xeVgu', 44],
    ['1LMrzXgStjoqxdahJGjrXmPaHG2B3fKqR', 44],
    ['1HmRv2SfPYoyzRCbVjCawXvp7QQnifevYm', 44],
    ['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', 84],
    ['bc1q52n7qwdwu5ycyvefak7hjn5v6ky6qqw290ut9w', 84],
    ['bc1qqfffz6zf3am20jc42fnjfe092s75k5nz8jf4h7', 84],
    ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 86],
    ['2N2LNsPC7xUxmbqbiQPiMLCVkiQjfkPfjuv', undefined],
    ['mv9rcNvSbmjFrgwuL3NqbphGfPzYfuSpMC', undefined],
    ['bcrt1qfg8ashdflwgukngfmmw2xkm93mpjl9hh8ka274', undefined],
    ['invalid', undefined],
  ],
}

const api = `address`
describe(`${asset.name} ${api} vector tests`, () => {
  runVectorTests({ asset, vectors, api })
})
