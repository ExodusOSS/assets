import { runObjectVectorTests } from '@exodus/assets-testing'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const vectors = {
  encodeMultisigContract: [
    [
      {},
      { version: 0, threshold: 0 },
      new Error('publicKeys must be an Array of Buffers representing compressed public keys'),
    ],
    [
      ['foo'],
      { version: 0, threshold: 0 },
      new Error('publicKeys must be an Array of Buffers representing compressed public keys'),
    ],
    [
      ['_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c25800'],
      { version: 0, threshold: 0 },
      new Error('publicKeys must be an Array of Buffers representing compressed public keys'),
    ],
    [
      [],
      { version: 0, threshold: 0 },
      new Error('asset.encodeMultisigContract supports from 1 to 16 pubKeys'),
    ],
    [
      [
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
      ],
      { version: 0, threshold: 0 },
      new Error('asset.encodeMultisigContract supports from 1 to 16 pubKeys'),
    ],
    [
      [
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 0, threshold: 1 },
      new Error('publicKeys must not contain any duplicates'),
    ],
    [
      [
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 'foo', threshold: 0 },
      new TypeError('asset.encodeMultisigContract requires meta.version to be an integer'),
    ],
    [
      [
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 2.6, threshold: 0 },
      new TypeError('asset.encodeMultisigContract requires meta.version to be an integer'),
    ],
    [
      [
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 1, threshold: 0 },
      new Error('asset.encodeMultisigContract does not support version 1'),
    ],
    [
      [
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 0, threshold: 'foo' },
      new Error(
        'asset.encodeMultisigContract requires meta.threshold to be an integer between 1 and 16'
      ),
    ],
    [
      [
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 0, threshold: 2.6 },
      new Error(
        'asset.encodeMultisigContract requires meta.threshold to be an integer between 1 and 16'
      ),
    ],
    [
      [
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 0, threshold: 0 },
      new Error(
        'asset.encodeMultisigContract requires meta.threshold to be an integer between 1 and 16'
      ),
    ],
    [
      [
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 0, threshold: 17 },
      new Error(
        'asset.encodeMultisigContract requires meta.threshold to be an integer between 1 and 16'
      ),
    ],
    [
      [
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 0, threshold: 3 },
      new Error('threshold must be <= publicKeys.length'),
    ],
    [
      [
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
      ],
      { version: 0, threshold: 2 },
      { address: 'bc1pte6ajxphdgfy2v9wwqw798uvy8rckzegwa0hx7h5qjf6et03uytqzw480d' },
    ],
    [
      [
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
      ],
      { version: 0, threshold: 2 },
      { address: 'bc1pte6ajxphdgfy2v9wwqw798uvy8rckzegwa0hx7h5qjf6et03uytqzw480d' },
    ],
    [
      [
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
      ],
      { version: 0, threshold: 1 },
      { address: 'bc1pfjgv0a0hyl0ghv05jtt25fu9maa6a088vdah3we3mm8sycv2t4kqa3jyxh' },
    ],
    [
      [
        '_0x031e33f96b503f722f37e8f13f1ca0e3ca8c2c6189aa7475d59058ff8f6a932131',
        '_0x02b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
        '_0x0233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
      ],
      { address: 'bc1pv4q24ydp8j8fhdasqzrmf9ndpvzdnamvlahlqf7y78zj9wmgfnlqcfsaqn' },
    ],
    // BIP67 test vectors modified for tapscript multisig
    [
      [
        '_0x02ff12471208c14bd580709cb2358d98975247d8765f92bc25eab3b2763ed605f8',
        '_0x02fe6f0a5a297eb38c391581c4413e084773ea23954d93f7753db7dc0adc188b2f',
      ],
      {
        address: 'bc1pzqxq46a0f4gmv7fmz643ehpx35ug5ydky9j2rw8uadn7jt9x5v9s55z33n',
        scriptTree: {
          output:
            '_0x20fe6f0a5a297eb38c391581c4413e084773ea23954d93f7753db7dc0adc188b2fac20ff12471208c14bd580709cb2358d98975247d8765f92bc25eab3b2763ed605f8ba529c',
        },
      },
    ],
    [
      [
        '_0x02632b12f4ac5b1d1b72b2a3b508c19172de44f6f46bcee50ba33f3f9291e47ed0',
        '_0x027735a29bae7780a9755fae7a1c4374c656ac6a69ea9f3697fda61bb99a4f3e77',
        '_0x02e2cc6bd5f45edd43bebe7cb9b675f0ce9ed3efe613b177588290ad188d11b404',
      ],
      {
        address: 'bc1pypg7x4qgddd7xnygsv6wcmznnsunmf6f5c0pxmzhfw98l2wj7cwq59tz8e',
        scriptTree: {
          output:
            '_0x20632b12f4ac5b1d1b72b2a3b508c19172de44f6f46bcee50ba33f3f9291e47ed0ac207735a29bae7780a9755fae7a1c4374c656ac6a69ea9f3697fda61bb99a4f3e77ba20e2cc6bd5f45edd43bebe7cb9b675f0ce9ed3efe613b177588290ad188d11b404ba539c',
        },
      },
    ],
    [
      [
        '_0x030000000000000000000000000000000000004141414141414141414141414141',
        '_0x020000000000000000000000000000000000004141414141414141414141414141',
        '_0x020000000000000000000000000000000000004141414141414141414141414140',
        '_0x030000000000000000000000000000000000004141414141414141414141414140',
      ],
      {
        address: 'bc1p8a4vyk3u9a6g7ah07fkgvrarwfnf3r89q6efkh68evwwwt6ruk0s6pr6ku',
        scriptTree: {
          output:
            '_0x200000000000000000000000000000000000004141414141414141414141414140ac200000000000000000000000000000000000004141414141414141414141414140ba200000000000000000000000000000000000004141414141414141414141414141ba200000000000000000000000000000000000004141414141414141414141414141ba549c',
        },
      },
    ],
    [
      [
        '_0x022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da',
        '_0x03e3818b65bcc73a7d64064106a859cc1a5a728c4345ff0b641209fba0d90de6e9',
        '_0x021f2f6e1e50cb6a953935c3601284925decd3fd21bc445712576873fb8c6ebc18',
      ],
      {
        address: 'bc1pvhv5h22kvdar4f2ge6xrp2khg8m8cnwqh8xrrt2deetum8dly9js9f0zph',
        scriptTree: {
          output:
            '_0x201f2f6e1e50cb6a953935c3601284925decd3fd21bc445712576873fb8c6ebc18ac202df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014daba20e3818b65bcc73a7d64064106a859cc1a5a728c4345ff0b641209fba0d90de6e9ba539c',
        },
      },
    ],
  ],
}

describe(`bitcoin encodeMultisigContract vector tests`, () => {
  const asset = assetPlugin.createAsset({ assetClientInterface })
  runObjectVectorTests({
    testName: 'bitcoin.encodeMultisigContract',
    object: { encodeMultisigContract: asset.encodeMultisigContract },
    vectors,
  })
})
