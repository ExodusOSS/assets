import { validateRequest } from '../../lib/rpc-handlers/validator.js'

describe('validateRequest', () => {
  describe('with Solana requests', () => {
    it.each([
      {
        jsonrpc: '2.0',
        method: 'sol_connect',
        params: { onlyIfTrusted: false },
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_connect',
        params: { onlyIfTrusted: true },
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signIn',
        params: {
          domain: 'some string',
          address: 'some string',
          statement: 'some string',
          uri: 'some string',
          version: 'some string',
          chainId: 'some string',
          nonce: 'some string',
          issuedAt: 'some string',
          expirationTime: 'some string',
          notBefore: 'some string',
          requestId: 'some string',
          resources: ['some string'],
        },
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signIn',
        params: {},
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECWRnbrjKXGag+QYiHjIdlt5dDPuILna0ZayVIZ+Rz591/WQrxBQ0kqZMgjovFyp516VVOY9jCBoZX63nVszu3AIbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAllTransactions',
        params: [
          [
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECWRnbrjKXGag+QYiHjIdlt5dDPuILna0ZayVIZ+Rz591/WQrxBQ0kqZMgjovFyp516VVOY9jCBoZX63nVszu3AIbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          ],
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAllTransactions',
        params: [
          [
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECWRnbrjKXGag+QYiHjIdlt5dDPuILna0ZayVIZ+Rz591/WQrxBQ0kqZMgjovFyp516VVOY9jCBoZX63nVszu3AIbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECWRnbrjKXGag+QYiHjIdlt5dDPuILna0ZayVIZ+Rz591/WQrxBQ0kqZMgjovFyp516VVOY9jCBoZX63nVszu3AIbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          ],
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          null,
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          {},
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          {
            maxRetries: 3,
            preflightCommitment: 'processed',
            skipPreflight: false,
          },
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signMessage',
        params: ['c2lnbiBiZWxvdw==', { display: 'hex' }],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signMessage',
        params: ['c2lnbiBiZWxvdw==', { display: 'utf8' }],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_getLatestBlockhash',
        params: [],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_getLatestBlockhash',
        params: ['finalized'],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
    ])('returns the same value if valid', (value) => {
      const result = validateRequest(value)
      expect(result).toEqual(value)
    })

    it.each([
      {
        jsonrpc: '2.0',
        method: 'sol_unknown',
        params: [],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '1.0',
        method: 'sol_connect',
        params: [true],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_connect',
        params: [],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_connect',
        params: ['invalid'],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'eth_feeHistory',
        params: [],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signTransaction',
        params: [],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signTransaction',
        params: [''],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signTransaction',
        params: ['invalidTx'],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAllTransactions',
        params: [],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAllTransactions',
        params: [[]],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAllTransactions',
        params: [['']],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAllTransactions',
        params: [['invalidTx']],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: ['invalidTx', null],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          'invalidOptions',
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          { maxRetries: -1 },
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          { preflightCommitment: 'invalidValue' },
        ],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signMessage',
        params: [],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signMessage',
        params: ['c2lnbiBiZWxvdw=='],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signMessage',
        params: ['invalidMessage', { display: 'hex' }],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_signMessage',
        params: ['c2lnbiBiZWxvdw==', { display: 'invalidDisplay' }],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_getLatestBlockhash',
        params: [['finalized']],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'sol_getLatestBlockhash',
        params: [{ commitment: 'finalized' }],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
    ])('returns invalid', (value) => {
      expect(() => validateRequest(value)).toThrow(/JSON validation failed/)
    })

    it('should sanitize request', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          {
            skipPreflight: false,
            name: 'Supply 0.01 SOL',
            preflightCommitment: 'confirmed',
            invalidProperty: 'invalid',
            maxRetries: 10,
            minContextSlot: 4,
          },
        ],
        id: '79a31b7f-89dd-4ed5-b6a8-97c7a168a4cf',
      }
      const expectedResult = {
        jsonrpc: '2.0',
        method: 'sol_signAndSendTransaction',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 10,
            minContextSlot: 4,
          },
        ],
        id: '79a31b7f-89dd-4ed5-b6a8-97c7a168a4cf',
      }
      const result = validateRequest(request)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('with Solana Mobile requests', () => {
    it.each([
      {
        jsonrpc: '2.0',
        method: 'sms_connect',
        params: [true, { isVerified: true }],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_connect',
        params: [false, { isVerified: false }],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_connect',
        params: [
          false,
          {
            name: 'test',
            origin: 'https://app.com',
            icon: '/test.png',
            isVerified: true,
          },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signTransactions',
        params: [
          [
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECWRnbrjKXGag+QYiHjIdlt5dDPuILna0ZayVIZ+Rz591/WQrxBQ0kqZMgjovFyp516VVOY9jCBoZX63nVszu3AIbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          ],
          {
            authorizedPublicKey: 'G2Hv6F2DgPv2X7C5NEZBicViHoqxxexYRufaCJ2XJVYv',
          },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signTransactions',
        params: [
          [
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECWRnbrjKXGag+QYiHjIdlt5dDPuILna0ZayVIZ+Rz591/WQrxBQ0kqZMgjovFyp516VVOY9jCBoZX63nVszu3AIbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECWRnbrjKXGag+QYiHjIdlt5dDPuILna0ZayVIZ+Rz591/WQrxBQ0kqZMgjovFyp516VVOY9jCBoZX63nVszu3AIbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          ],
          {
            authorizedPublicKey: 'G2Hv6F2DgPv2X7C5NEZBicViHoqxxexYRufaCJ2XJVYv',
          },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signAndSendTransactions',
        params: [
          [
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          ],
          {
            authorizedPublicKey: 'G2Hv6F2DgPv2X7C5NEZBicViHoqxxexYRufaCJ2XJVYv',
          },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signAndSendTransactions',
        params: [
          [
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          ],
          {
            authorizedPublicKey: 'G2Hv6F2DgPv2X7C5NEZBicViHoqxxexYRufaCJ2XJVYv',
          },
          { minContextSlot: 1 },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signMessages',
        params: [
          ['c2lnbiBiZWxvdw=='],
          {
            authorizedPublicKey: 'G2Hv6F2DgPv2X7C5NEZBicViHoqxxexYRufaCJ2XJVYv',
          },
        ],
        id: 1,
      },
    ])('returns the same value if valid', (value) => {
      const result = validateRequest(value)
      expect(result).toEqual(value)
    })

    it.each([
      { jsonrpc: '2.0', method: 'sms_unknown', params: [], id: 1 },
      { jsonrpc: '2.0', method: 'sms_connect', params: [], id: 1 },
      { jsonrpc: '2.0', method: 'sms_connect', params: ['invalid'], id: 1 },
      {
        jsonrpc: '2.0',
        method: 'sms_connect',
        params: { onlyIfTrusted: 'bad' },
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_connect',
        params: { onlyIfTrusted: true, origin: 'bad-url' },
        id: 1,
      },
      { jsonrpc: '2.0', method: 'sms_signTransactions', params: [], id: 1 },
      {
        jsonrpc: '2.0',
        method: 'sms_signTransactions',
        params: [
          [],
          {
            authorizedPublicKey: 'G2Hv6F2DgPv2X7C5NEZBicViHoqxxexYRufaCJ2XJVYv',
          },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signTransactions',
        params: [
          [''],
          {
            authorizedPublicKey: 'G2Hv6F2DgPv2X7C5NEZBicViHoqxxexYRufaCJ2XJVYv',
          },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signTransactions',
        params: [
          ['invalidTx'],
          {
            authorizedPublicKey: 'G2Hv6F2DgPv2X7C5NEZBicViHoqxxexYRufaCJ2XJVYv',
          },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signAndSendTransactions',
        params: ['invalidTx', null],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signAndSendTransactions',
        params: [['invalidTx', null]],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signAndSendTransactions',
        params: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signAndSendTransactions',
        params: [
          [
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECCbO4E+0UaCRlmm2rfz4IvPL91WkM8lem7fy/UDZnFkNOFIkahyBWONw+jquVkmWILSd2RNc8U28Z3YgJWad+aYbPHmiuMk0i86y9P+0JhGEi5nd04WMcbZInhNGmfwCMAQEBAAA=',
          ],
          null,
        ],
        id: 1,
      },
      { jsonrpc: '2.0', method: 'sms_signMessages', params: [], id: 1 },
      {
        jsonrpc: '2.0',
        method: 'sms_signMessages',
        params: ['c2lnbiBiZWxvdw=='],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'sms_signMessages',
        params: [['invalidMessage']],
        id: 1,
      },
    ])('returns invalid', (value) => {
      expect(() => validateRequest(value)).toThrow(/JSON validation failed/)
    })
  })
})
