const fixture = {
  initializeEscrow: [
    {
      instructions: [
        {
          pubkey: 'EpGkR4PcMYHLwZJn7rnxmmLihaZkaAeQLsw4ao3nUUmC',
          isWritable: false,
          isSigner: true,
        },
        {
          pubkey: '38y2gagfKoVVmLXxqESXWkBLHarzEq6f6cmA1DoAqRnB',
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: '3FLp3gYkXfh7ZjB7PPoidfSdzHWxqfG1mYH1BkzAfwMe',
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          isWritable: false,
          isSigner: false,
        },
        { pubkey: '11111111111111111111111111111111', isWritable: false, isSigner: false },
      ],
      programId: 'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8',
      data: '96d480ba7401837100e40b5402000000fd',
    },
  ],
  cancelEscrow: [
    {
      instructions: [
        {
          pubkey: 'EpGkR4PcMYHLwZJn7rnxmmLihaZkaAeQLsw4ao3nUUmC',
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: '38y2gagfKoVVmLXxqESXWkBLHarzEq6f6cmA1DoAqRnB',
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: 'GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp',
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: 'AicHKDZR5jLfozYcek5ZHw5mJfxBNFbUwHF2nM4qF8oN',
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          isWritable: false,
          isSigner: false,
        },
      ],
      programId: 'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8',
      data: '9ccb36b326482115',
    },
  ],
  exchange: [
    {
      instructions: [
        {
          pubkey: 'FuDxYSDtRAG4P65wxAmUZShBSGtn79o2yJpPF13LQB87',
          isWritable: false,
          isSigner: true,
        },
        {
          pubkey: '38y2gagfKoVVmLXxqESXWkBLHarzEq6f6cmA1DoAqRnB',
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: 'EpGkR4PcMYHLwZJn7rnxmmLihaZkaAeQLsw4ao3nUUmC',
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: 'DvijtTLQGCmmFMPpthitkpP35hGHxdJRxAERjtN13mPg',
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: 'GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp',
          isWritable: false,
          isSigner: false,
        },
        { pubkey: '11111111111111111111111111111111', isWritable: false, isSigner: false },
        {
          pubkey: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: '2NZukH2TXpcuZP4htiuT8CFxcaQSWzkkR6kepSWnZ24Q',
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: '4ysTyhoHDAv28dGUD2ASS9zmAHi3QZyXVQW25f6QwWN',
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: 'D6ZQMLTJAa14XhzCFBJ2uuPjYDbYfewrVDVSyFZSuBYe',
          isWritable: true,
          isSigner: false,
        },
      ],
      programId: 'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8',
      data: '438e36d81f1d1b5c80f0fa020000000053d6a39de90a9226816a6a4a04a0ff870bc6861aa1d114b1b82d9bd5d03a1e21',
    },
  ],
}

export default fixture
