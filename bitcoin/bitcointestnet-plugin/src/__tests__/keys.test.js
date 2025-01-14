import { runVectorTests } from '@exodus/assets-testing'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface } from './utils/assetClientInterface.js'

const asset = assetPlugin.createAsset({ assetClientInterface: dummyAssetClientInterface })

const vectors = {
  encodePrivate: [
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      true,
      'cMejJTAfeaHmthZBKKxk9sDHDPpiHwCZHri5A9kDk2s3bCpka2ej',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      false,
      '91bq6mSkeWkDtb7PGw96hXQdJJrn9pd9gAT57c4SznHKiPgfDef',
    ],
  ],

  encodePublic: [
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 44 },
      'mywzdGc4zhBTnNk6wHUGzzjC6Qc9Cnsjbc',
    ],
    [
      '_0x000289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 44 },
      'msxok8sifGwzmC6YGtoHUTt5xmEHkK6iK5',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 49 },
      '2N7FR6XfiUGRkjfhhyPqNxMn1eBjBouhWhQ',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 84 },
      'tb1qeghfha5yjp3ytf322zhsknyj44rudupaeufsqe',
    ],
    [
      '_0x000289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 84 },
      'tb1q3zzjlh0s763276sgfyh0u8d3w5th37x8vqrcfq',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 86 },
      'tb1phcnqwv23hvfhz6z5lqkxk6tpxh77z2ne06f389mzulp7ap303prs5568dj',
    ],
    [
      '_0x020289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 86 },
      'tb1pcpqut9w2zperwm7y3s9uegddrm0008ch9rz8grpuw0megg2cv9wq2zfpjr',
    ],
  ],
  encodePublicFromWIF: [
    ['5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ', new Error('Invalid network version')],
    ['5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF', new Error('Invalid network version')],
    ['92xeGfGuG8aY3gfxrcV8mp3sxzpdQYAj8E6ovD7A47k6boWbzB1', 'miqsEs3Gded49T4pqFxFgfo5QhN9KBnNen'],
  ],

  encodePublicBech32FromWIF: [
    ['5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ', new Error('Invalid network version')],
    ['5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF', new Error('Invalid network version')],
    [
      '92xeGfGuG8aY3gfxrcV8mp3sxzpdQYAj8E6ovD7A47k6boWbzB1',
      'tb1qy37qlxz9qm79npsq5s7ywcwl3q87ehft6dzsdp',
    ],
  ],
}

const api = `keys`
describe(`${asset.name} ${api} vector tests`, () => {
  runVectorTests({ asset, vectors, api })
})
