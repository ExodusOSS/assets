import { validateRequest } from '../../lib/rpc-handlers/validator.js'

describe('parseAndValidateRequest', () => {
  it.each([
    {
      jsonrpc: '2.0',
      method: 'eth_accounts',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          gas: '0x76c0',
          gasPrice: '0x9184e72a000',
          value: '0x9184e72a',
          data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        },
        'latest',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
          data: '0xc6888fa10000000000000000000000000000000000000000000000000000000000000003',
          value: '0x',
        },
        'latest',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_coinbase',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_createAccessList',
      params: [
        {
          to: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          from: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x89',
          chainName: 'Polygon',
          rpcUrls: ['https://polygon-rpc.com'],
          iconUrls: ['https://docs.astar.network/img/astar-logo.svg'],
          nativeCurrency: {
            symbol: 'MATIC',
            decimals: 18,
          },
          blockExplorerUrls: ['https://polygonscan.co'],
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_estimateGas',
      params: [
        {
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          gas: '0x76c0',
          gasPrice: '0x9184e72a000',
          value: '0x9184e72a',
          data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
          maxPriorityFeePerGas: '0x17472b',
          maxFeePerGas: '0x41a',
        },
        'latest',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_feeHistory',
      params: ['0x64', '0xe6d3c8', [0, 0.5, 1, 1.5, 3, 80]],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: ['0x407d73d8a49eeb85d32cf465507dd71d507100c1', 'latest'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBlockByHash',
      params: [
        '0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331',
        true,
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['0x1b4', true],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBlockTransactionCountByHash',
      params: ['0x407d73d8a49eeb85d32cf465507dd71d507100c1'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBlockTransactionCountByNumber',
      params: ['0xe8'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: ['0xd5677cf67b5aa051bb40496e68ad359eb97cfbf8'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: ['0xd5677cf67b5aa051bb40496e68ad359eb97cfbf8', 'latest'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getCompilers',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getLogs',
      params: [
        {
          fromBlock: '0xe4e1c0',
          toBlock: '0xe4e224',
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          topics: [],
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getLogs',
      params: [
        {
          fromBlock: '0x101f64d',
          toBlock: '0x101f657',
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          topics: [
            [
              '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
            ],
            '0x000000000000000000000000c4f28e9d9eca931064257cb82b3f53f32ae4efe6',
          ],
        },
      ],
      id: '17b88b42-3553-45d9-aa73-f36445378fb5',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getLogs',
      params: [
        {
          fromBlock: '0x102222f',
          toBlock: '0x1022239',
          address: '0x0000000000a39bb272e79075ade125fd351887ac',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            null,
            '0x000000000000000000000000c4f28e9d9eca931064257cb82b3f53f32ae4efe6',
          ],
        },
      ],
      id: '970bac90-b225-40db-9be3-c890d8364898',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getProof',
      params: ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', [], '0xe4e1c0'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getStorageAt',
      params: ['0x407d73d8a49eeb85d32cf465507dd71d507100c1', '0x0', 'latest'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByBlockHashAndIndex',
      params: [
        '0x52418e24ef886aa2dbf24618703352d8243f84bf8342a3405d79997ea0a3edaf',
        '0x0',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByBlockHashAndIndex',
      params: ['0xe6dce6', '0x0'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: ['0x407d73d8a49eeb85d32cf465507dd71d507100c1'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: ['0x407d73d8a49eeb85d32cf465507dd71d507100c1', 'latest'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [
        '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getUncleCountByBlockHash',
      params: [
        '0x3b4f2835bd7241b09398a4b4ca77ecdb27161b6bcf1297a39856de145dca1d5e',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getUncleByBlockHashAndIndex',
      params: [
        '0x3b4f2835bd7241b09398a4b4ca77ecdb27161b6bcf1297a39856de145dca1d5e',
        '0x0',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getUncleByBlockNumberAndIndex',
      params: ['0xe6d7c7', '0x0'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getWork',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_maxPriorityFeePerGas',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_hashrate',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_pendingTransactions',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_requestAccounts',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [
        '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          chainId: '0x1',
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          gas: '0x76c0',
          gasPrice: '0x9184e72a000',
          value: '0x9184e72a',
          data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        { from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155', data: '0x' },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          value: '0x5af3107a4000',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          value: '0x5af3107a4000',
          maxPriorityFeePerGas: '0x3b9aca00',
          maxFeePerGas: '0x1ee1d01b8a',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          chainId: '0xf4240',
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          value: '0x5af3107a4000',
          maxPriorityFeePerGas: '0x',
          maxFeePerGas: '0x',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          chainId: 137,
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          value: '0x5af3107a4000',
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sign',
      params: ['0x9b2055d370f73ec7d8a03e965129118dc8f5bf83', '0xdeadbeaf'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTransaction',
      params: [
        {
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTransaction',
      params: [
        {
          from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
          gas: '0x76c0',
          gasPrice: '0x9184e72a000',
          value: '0x9184e72a',
          data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData',
      params: [
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        '{\\"types\\":{\\"EIP712Domain\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"version\\",\\"type\\":\\"string\\"},{\\"name\\":\\"chainId\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"verifyingContract\\",\\"type\\":\\"address\\"}],\\"Person\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"wallet\\",\\"type\\":\\"address\\"}],\\"Mail\\":[{\\"name\\":\\"from\\",\\"type\\":\\"Person\\"},{\\"name\\":\\"to\\",\\"type\\":\\"Person\\"},{\\"name\\":\\"contents\\",\\"type\\":\\"string\\"}]},\\"primaryType\\":\\"Mail\\",\\"domain\\":{\\"name\\":\\"Ether Mail\\",\\"version\\":\\"1\\",\\"chainId\\":1,\\"verifyingContract\\":\\"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC\\"},\\"message\\":{\\"from\\":{\\"name\\":\\"Cow\\",\\"wallet\\":\\"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826\\"},\\"to\\":{\\"name\\":\\"Bob\\",\\"wallet\\":\\"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB\\",\\"meta\\":{\\"name\\":\\"kranthi\\"}},\\"contents\\":\\"Hello, Bob!\\"}}',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData',
      params: [
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        '{"domain":{"name":"Off-Chain Cancellation","version":"1.0.0","chainId":137},"primaryType":"OrderHashes","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"}],"OrderHashes":[{"name":"orderHashes","type":"bytes32[]"}]},"message":{"orderHashes":["0xbdeda14aad46f8c1a5744ec2f526d3d9ff92a2bdaac93213c809b46eced1c00c"]}}',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData',
      params: [
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        '{\\"types\\":{\\"EIP712Domain\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"version\\",\\"type\\":\\"string\\"},{\\"name\\":\\"verifyingContract\\",\\"type\\":\\"address\\"},{\\"name\\":\\"salt\\",\\"type\\":\\"bytes32\\"}],\\"MetaTransaction\\":[{\\"name\\":\\"nonce\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"from\\",\\"type\\":\\"address\\"},{\\"name\\":\\"functionSignature\\",\\"type\\":\\"bytes\\"}]},\\"domain\\":{\\"name\\":\\"USD Coin (PoS)\\",\\"version\\":\\"1\\",\\"salt\\":\\"0x0000000000000000000000000000000000000000000000000000000000000089\\",\\"verifyingContract\\":\\"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174\\"},\\"message\\":{\\"nonce\\":8,\\"from\\":\\"0x34eCd69A9BC05e2c3b8852318c7e39e01096855a\\",\\"functionSignature\\":\\"0x095ea7b3000000000000000000000000a6ea1ed4aec85df277fae3512f8a6cbb40c1fe7e00000000000000000000000000000000000000000000000000000000004c4b40\\"},\\"primaryType\\":\\"MetaTransaction\\"}',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData',
      params: [
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        '{\\"types\\":{\\"EIP712Domain\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"version\\",\\"type\\":\\"string\\"},{\\"name\\":\\"chainId\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"verifyingContract\\",\\"type\\":\\"address\\"}],\\"Details\\":[{\\"name\\":\\"action\\",\\"type\\":\\"string\\"},{\\"name\\":\\"market\\",\\"type\\":\\"string\\"},{\\"name\\":\\"betting\\",\\"type\\":\\"string\\"},{\\"name\\":\\"stake\\",\\"type\\":\\"string\\"},{\\"name\\":\\"odds\\",\\"type\\":\\"string\\"},{\\"name\\":\\"returning\\",\\"type\\":\\"string\\"},{\\"name\\":\\"fills\\",\\"type\\":\\"FillObject\\"}],\\"FillObject\\":[{\\"name\\":\\"orders\\",\\"type\\":\\"Order[]\\"},{\\"name\\":\\"makerSigs\\",\\"type\\":\\"bytes[]\\"},{\\"name\\":\\"takerAmounts\\",\\"type\\":\\"uint256[]\\"},{\\"name\\":\\"fillSalt\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"beneficiary\\",\\"type\\":\\"address\\"}],\\"Order\\":[{\\"name\\":\\"marketHash\\",\\"type\\":\\"bytes32\\"},{\\"name\\":\\"baseToken\\",\\"type\\":\\"address\\"},{\\"name\\":\\"totalBetSize\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"percentageOdds\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"expiry\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"salt\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"maker\\",\\"type\\":\\"address\\"},{\\"name\\":\\"executor\\",\\"type\\":\\"address\\"},{\\"name\\":\\"isMakerBettingOutcomeOne\\",\\"type\\":\\"bool\\"}]},\\"primaryType\\":\\"Details\\",\\"domain\\":{\\"name\\":\\"SportX\\",\\"version\\":\\"1.0\\",\\"chainId\\":1,\\"verifyingContract\\":\\"0xCD667A4E7E377388b3aD8d57C3AEc4aC914c84Eb\\"},\\"message\\":{\\"action\\":\\"N/A\\",\\"market\\":\\"N/A\\",\\"betting\\":\\"N/A\\",\\"stake\\":\\"N/A\\",\\"odds\\":\\"N/A\\",\\"returning\\":\\"N/A\\",\\"fills\\":{\\"makerSigs\\":[\\"0xb9819baaabba39d48902f1b453a29a5fc0ef3422ac312bf6e2257693461f0a833ec9154ce77e727539568067a1935cc98f005e75b272451147622b68eef5578b1b\\"],\\"orders\\":[{\\"marketHash\\":\\"0x7c9788cc1637a2fd0f2d91b36aa5b635fe549c3fdf37ec2ea8fef09ebbbcbbed\\",\\"baseToken\\":\\"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174\\",\\"totalBetSize\\":\\"1000000000\\",\\"percentageOdds\\":\\"38438808175326280000\\",\\"expiry\\":\\"2209006800\\",\\"salt\\":\\"87951005617166609016926856494618695023408730509173194485836040977253491658788\\",\\"maker\\":\\"0xF59E93290383ED15F73Ee923EbbF29f79e37B6d8\\",\\"executor\\":\\"0x52adf738AAD93c31f798a30b2C74D658e1E9a562\\",\\"isMakerBettingOutcomeOne\\":false}],\\"takerAmounts\\":[\\"3122000\\"],\\"fillSalt\\":\\"33516840861998001497242314367927601817812364389162589889376108436881071111460\\",\\"beneficiary\\":\\"0x0000000000000000000000000000000000000000\\"}}}',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData_v1',
      params: [
        [
          { type: 'string', name: 'Message', value: 'Hi, Alice!' },
          { type: 'uint32', name: 'A number', value: '1337' },
        ],
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData_v3',
      params: [
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        '{\\"types\\":{\\"EIP712Domain\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"version\\",\\"type\\":\\"string\\"},{\\"name\\":\\"chainId\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"verifyingContract\\",\\"type\\":\\"address\\"}],\\"Person\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"wallet\\",\\"type\\":\\"address\\"}],\\"Mail\\":[{\\"name\\":\\"from\\",\\"type\\":\\"Person\\"},{\\"name\\":\\"to\\",\\"type\\":\\"Person\\"},{\\"name\\":\\"contents\\",\\"type\\":\\"string\\"}]},\\"primaryType\\":\\"Mail\\",\\"domain\\":{\\"name\\":\\"Ether Mail\\",\\"version\\":\\"1.23.2\\",\\"chainId\\":1,\\"verifyingContract\\":\\"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC\\"},\\"message\\":{\\"from\\":{\\"name\\":\\"Cow\\",\\"wallet\\":\\"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826\\"},\\"to\\":{\\"name\\":\\"Bob\\",\\"wallet\\":\\"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB\\",\\"meta\\":{\\"name\\":\\"kranthi\\"}},\\"contents\\":\\"Hello, Bob!\\"}}',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData_v4',
      params: [
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        '{\\"types\\":{\\"EIP712Domain\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"version\\",\\"type\\":\\"string\\"},{\\"name\\":\\"chainId\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"verifyingContract\\",\\"type\\":\\"address\\"}],\\"Group\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"members\\",\\"type\\":\\"Person[]\\"}],\\"Mail\\":[{\\"name\\":\\"from\\",\\"type\\":\\"Person\\"},{\\"name\\":\\"to\\",\\"type\\":\\"Person[]\\"},{\\"name\\":\\"contents\\",\\"type\\":\\"string\\"}],\\"Person\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"wallets\\",\\"type\\":\\"address[]\\"}]},\\"domain\\":{\\"chainId\\":1,\\"name\\":\\"Ether Mail\\",\\"verifyingContract\\":\\"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC\\",\\"version\\":\\"1\\"},\\"primaryType\\":\\"Mail\\",\\"message\\":{\\"contents\\":\\"Hello, Bob!\\",\\"attachedMoneyInEth\\":4.2,\\"from\\":{\\"name\\":\\"Cow\\",\\"wallets\\":[\\"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826\\",\\"0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF\\"]},\\"to\\":[{\\"name\\":\\"Bob\\",\\"wallets\\":[\\"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB\\",\\"0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57\\",\\"0xB0B0b0b0b0b0B000000000000000000000000000\\"]}]}}',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData_v4',
      params: [
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        '{\\"types\\":{\\"EIP712Domain\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"version\\",\\"type\\":\\"string\\"},{\\"name\\":\\"chainId\\",\\"type\\":\\"uint256\\"},{\\"name\\":\\"verifyingContract\\",\\"type\\":\\"address\\"}],\\"Person\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"wallet\\",\\"type\\":\\"address\\"}],\\"Mail\\":[{\\"name\\":\\"from\\",\\"type\\":\\"Person\\"},{\\"name\\":\\"to\\",\\"type\\":\\"Person\\"},{\\"name\\":\\"contents\\",\\"type\\":\\"string\\"}]},\\"primaryType\\":\\"Mail\\",\\"domain\\":{\\"name\\":\\"Ether Mail\\",\\"version\\":\\"1.23.2\\",\\"chainId\\":1,\\"verifyingContract\\":\\"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC\\"},\\"message\\":{\\"from\\":{\\"name\\":\\"Cow\\",\\"wallet\\":\\"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826\\"},\\"to\\":{\\"name\\":\\"Bob\\",\\"wallet\\":\\"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB\\",\\"meta\\":{\\"name\\":\\"kranthi\\"}},\\"contents\\":\\"Hello, Bob!\\"}}',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_submitWork',
      params: [
        '0x0000000000000001',
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0xD1FE5700000000000000000000000000D1FE5700000000000000000000000000',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'net_version',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'personal_sign',
      params: [
        'Greetings from Polygon!\\n\\nSign this message to log into Polygon wallet. This signature will not cost you any fees.\\n\\nTimestamp: 1658344471',
        '0xc04b6E3d3c2f743Ec4Be1db438d1870deb8d9ab0',
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_getPermissions',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          symbol: 'FOO',
          decimals: 18,
          image: 'https://foo.io/token-image.svg',
        },
      },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          symbol: 'FOO',
          decimals: 18,
          image:
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
        },
      },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          symbol: 'FOO',
          decimals: 18,
          image:
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          chainId: 0x89,
        },
      },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: { address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155' },
      },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'web3_clientVersion',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_getSnaps',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
  ])('returns the same value if valid', (value) => {
    const result = validateRequest(value)
    expect(result).toEqual(value)
  })

  it.each([
    {
      jsonrpc: '2.0',
      method: 'eth_accounts',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_coinbase',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_estimateGas',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_estimateGas',
      params: [
        { aaaaaaaaaaaaaaaaaaaaa: '0xb60e8dd61c5d32be8058bb8eb970870f07233155' },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBlockByHash',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBlockTransactionCountByHash',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getBlockTransactionCountByNumber',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getCompilers',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getStorageAt',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByBlockHashAndIndex',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByBlockHashAndIndex',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getUncleCountByBlockHash',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getUncleByBlockHashAndIndex',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getUncleByBlockNumberAndIndex',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_getWork',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_hashrate',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_pendingTransactions',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_requestAccounts',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        { gasPrice: '0x9184e72a000', value: '0x9184e72a', chainId: '1' },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_sign',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTransaction',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTransaction',
      params: [
        {
          from: '0x100500',
          data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTransaction',
      params: [{ gasPrice: '0x9184e72a000', value: '0x9184e72a' }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData',
      params: [
        '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        {
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
            ],
            Person: [
              { name: 'name', type: 'string' },
              { name: 'wallet', type: 'address' },
            ],
            Mail: [
              { name: 'from', type: 'Person' },
              { name: 'to', type: 'Person' },
              { name: 'contents', type: 'string' },
            ],
          },
        },
      ],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData',
      params: ['0xb60e8dd61c5d32be8058bb8eb970870f07233155', '__proto__'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData_v1',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'eth_signTypedData_v4',
      params: ['0xb60e8dd61c5d32be8058bb8eb970870f07233155', {}],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'net_version',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_getPermissions',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_requestPermissions',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_requestPermissions',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_requestPermissions',
      params: [{ invalid: {} }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: [] }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: { invalid: 42 } }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_revokePermissions',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_revokePermissions',
      params: ['invalid'],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_revokePermissions',
      params: [{ invalid: {} }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_revokePermissions',
      params: [{ eth_accounts: [] }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_revokePermissions',
      params: [{ eth_accounts: { invalid: 42 } }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_switchEthereumChain',
      params: [],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: 137 }],
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: { type: 'ERC20', options: {} },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: { options: {} },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: { type: 'ERC20' },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          symbol: 'FOO',
          decimals: 18,
          image: 'https://foo.io/token-image.svg',
        },
      },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
    {
      jsonrpc: '2.0',
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          symbol: 'FOO',
          decimals: 18,
          image: 'foo.io/token-image.svg',
        },
      },
      id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
    },
  ])('throws if invalid', (value) => {
    expect(() => validateRequest(value)).toThrow(/JSON validation failed/)
  })

  describe('with eth_sendTransaction', () => {
    it('removes additional fields if valid', () => {
      const requests = [
        {
          jsonrpc: '2.0',
          method: 'eth_sendTransaction',
          params: [
            {
              from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
              to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
              value: '0x5af3107a4000',
              maxPriorityFeePerGas: '0x',
              maxFeePerGas: '0x',
              protocol: 'ui-test',
              unknownField: 'foo',
              additionalField1: { additionalField2: 'bar' },
              nonce: 301,
            },
          ],
          id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
        },
      ]
      const sanitizedRequests = [
        {
          jsonrpc: '2.0',
          method: 'eth_sendTransaction',
          params: [
            {
              from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
              to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
              value: '0x5af3107a4000',
              maxPriorityFeePerGas: '0x',
              maxFeePerGas: '0x',
            },
          ],
          id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
        },
      ]

      requests.forEach((request, index) => {
        const result = validateRequest(request)
        expect(result).toEqual(sanitizedRequests[index])
      })
    })
  })
})
