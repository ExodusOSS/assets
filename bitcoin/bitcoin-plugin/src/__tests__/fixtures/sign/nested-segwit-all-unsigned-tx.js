const nestedSegwitAllUnsignedTx = {
  accountIndex: 0,
  rawTx:
    '02000000000101427a74836f4a2b7a9350a47181987a125cb6f41ea2096950fafeda1334f3a240000000001716001426876bc370fcb83c40ce4b42d3f0e5f44f5ab96bfdffffff010807000000000000225120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f5370247304402202325c343b2ea9cf2fa8d9a789f7a9513be5cbcf672b8fc9a27d8b6ecef907c1d022014799822207f281b40e153a8220ae3330bd3b62c1d44390b0741cb9894215a920121031174ac2115f7398a01179f96d677c9bc264598e02969e8b1b786aa588ef0830000000000',
  txId: 'a50ccc650fde391e452f54137759646ad7849022ca539ddcb25653c9e1ebc6e0',
  virtualSize: 725,
  unsignedTx: {
    txData: {
      inputs: [
        {
          address: '37PJ9gNHQy4t3DmHKHFwBQX7FPRKhK3U6Z',
          sequence: 4_294_967_293,
          txId: '40a2f33413dafefa506909a21ef4b65c127a988171a450937a2b4a6f83747a42',
          vout: 0,
          confirmations: 1,
          script: 'a9143e76d004cdd96eb49a98f3f5d5c050c9f23fcd1787',
          value: 2000,
        },
      ],
      outputs: [['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 1800]],
    },
    txMeta: {
      accountIndex: 0,
      addressPathsMap: {
        '37PJ9gNHQy4t3DmHKHFwBQX7FPRKhK3U6Z': 'm/0/0',
      },
      blockHeight: 768_520,
      rawTxs: [
        {
          rawData:
            '02000000000101e36574744c0f7b72b6320241dba86b22a9b9cf58268c8c69b4d89b71da80bef20100000000ffffffff02d00700000000000017a9143e76d004cdd96eb49a98f3f5d5c050c9f23fcd1787b64e0000000000002251203903835c81a806d5a935e78a877007146e61c8daf208816063661025f7c6f7e60140087c6893c6bb76f95787f9f6a242e7d543710bdbae8ca15f40f4153a53297d007e0890718b8ae5509a4e9044d77bd44617107f517beeca5d2e87450587661c3b00000000',
          txId: '40a2f33413dafefa506909a21ef4b65c127a988171a450937a2b4a6f83747a42',
        },
      ],
    },
  },
}

export default nestedSegwitAllUnsignedTx
