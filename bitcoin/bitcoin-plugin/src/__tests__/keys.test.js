import { runVectorTests } from '@exodus/assets-testing'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const vectors = {
  encodePrivate: [
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      true,
      'KwHjqYApDWbWjG5uvv9cnYiDbAXJdV6sDpZc3jHiEvD3LTfs2vje',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      false,
      '5HqCX2dD4Hg5vXc6ebFBpvrfeeW4zf5xLDb82yhwf3YGwMJQN31',
    ],
  ],

  encodePublic: [
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 44 },
      '1KS3LDX6BfkD1GGVDiVuB5WsER1SLPyGcc',
    ],
    [
      '_0x000289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 44 },
      '1DSrT5njrFWjz5cvZKpueYfm6mdao3wDxZ',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 49 },
      '3FhD2njgrovQXt5AJGDWLQnkRqX1yAnsBy',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 84 },
      'bc1qeghfha5yjp3ytf322zhsknyj44rudupan6jrm2',
    ],
    [
      '_0x000289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 84 },
      'bc1q3zzjlh0s763276sgfyh0u8d3w5th37x8xxctjn',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 86 },
      'bc1phcnqwv23hvfhz6z5lqkxk6tpxh77z2ne06f389mzulp7ap303prsruvgha',
    ],
    [
      '_0x020289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 86 },
      'bc1pcpqut9w2zperwm7y3s9uegddrm0008ch9rz8grpuw0megg2cv9wqa2lwgv',
    ],
    [
      '_0x04d0de0aaeaefad02b8bdc8a01a1b8b11c696bd3d66a2c5f10780d95b7df42645cd85228a6fb29940e858e7e55842ae2bd115d1ed7cc0e82d934e929c97648cb0a',
      { purpose: 44 },
      '1GAehh7TsJAHuUAeKZcXf5CnwuGuGgyX2S',
    ],
    [
      '_0x04d0de0aaeaefad02b8bdc8a01a1b8b11c696bd3d66a2c5f10780d95b7df42645cd85228a6fb29940e858e7e55842ae2bd115d1ed7cc0e82d934e929c97648cb0a',
      { purpose: 49 },
      '3D9iyFHi1Zs9KoyynUfrL82rGhJfYTfSG4',
    ],
    [
      '_0x04d0de0aaeaefad02b8bdc8a01a1b8b11c696bd3d66a2c5f10780d95b7df42645cd85228a6fb29940e858e7e55842ae2bd115d1ed7cc0e82d934e929c97648cb0a',
      { purpose: 84 },
      'bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr',
    ],
    [
      '_0x04d0de0aaeaefad02b8bdc8a01a1b8b11c696bd3d66a2c5f10780d95b7df42645cd85228a6fb29940e858e7e55842ae2bd115d1ed7cc0e82d934e929c97648cb0a',
      { purpose: 86 },
      'bc1pdj78vjhv4wukfzfu3qyvwclcewrsyfq8fyx2gvs8s850smsgw0yq8ykfa8',
    ],
  ],
  encodePublicFromWIF: [
    ['5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ', '1GAehh7TsJAHuUAeKZcXf5CnwuGuGgyX2S'],
    ['5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF', '1CC3X2gu58d6wXUWMffpuzN9JAfTUWu4Kj'],
  ],

  encodePublicBech32FromWIF: [
    [
      '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ',
      'bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr',
    ],
    [
      '5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF',
      'bc1q0tqql9ul7r0jlh9k2asaeru7lzehzskm4z2sm6',
    ],
  ],
}

const api = `keys`
describe(`bitcoin ${api} vector tests`, () => {
  runVectorTests({
    asset: assetPlugin.createAsset({ assetClientInterface }),
    vectors,
    api,
  })
})
