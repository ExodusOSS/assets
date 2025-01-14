const segwitOrdinals84AllUnsignedTx = {
  accountIndex: 0,
  rawTx:
    '020000000001010cd76cb4556a3d991541f669e2007fa4d177d9e4e164ac72c2ebb6289c7405d50000000000fdffffff01b80b000000000000225120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f5370247304402203ab78f99082c61c7ff79d609cdf6df33126c3f89d807d9983e3e4db07b265ed9022030a0f6fdeaffcf2ae2425010bd7933415f067d64669b8e62418485334350fca101210330389568898e891221d609254123d31a21b06c5048232ad0e171a9b8f3dd4dbe00000000',
  txId: 'e94d36c59eb712a5a98976f11d4aaaec30917f3ececd77790c36ac47860701a3',
  virtualSize: 725,
  unsignedTx: {
    txData: {
      inputs: [
        {
          address: 'bc1q33vprdyn82q6s5fqrvl4elvlx6tmry9e3j4302',
          sequence: 4_294_967_293,
          txId: 'd505749c28b6ebc272ac64e1e4d977d1a47f00e269f64115993d6a55b46cd70c',
          vout: 0,
          confirmations: 1,
          script: '00148c5811b4933a81a851201b3f5cfd9f3697b190b9',
          value: 6028,
        },
      ],
      outputs: [['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 3000]],
    },
    txMeta: {
      accountIndex: 0,
      addressPathsMap: {
        bc1q33vprdyn82q6s5fqrvl4elvlx6tmry9e3j4302: 'm/0',
      },
      blockHeight: 768_520,
      rawTxs: [
        {
          rawData:
            '0200000000010107cee72275af7d017cc43a40793f543793ae727952f1c27757f345e2c845ec960100000000ffffffff018c170000000000001600148c5811b4933a81a851201b3f5cfd9f3697b190b902483045022100ebfb5b2b72aed6462f68cef177c6f4317455b18d3da3dd0e09ca17a56f0d795b02205a4e478c231175ac06e251a315b7ed29f7fab6ce209dc3a6a81c66fb9177642a01210230e5658c1b090dc34ba9920efb4869954ea85cb77ced95303872906b15475ff800000000',
          txId: 'd505749c28b6ebc272ac64e1e4d977d1a47f00e269f64115993d6a55b46cd70c',
        },
      ],
    },
  },
}

export default segwitOrdinals84AllUnsignedTx
