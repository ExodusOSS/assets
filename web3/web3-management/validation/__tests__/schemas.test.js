import { validateRequest } from '../../lib/rpc-handlers/validator.js'

describe('validateRequest', () => {
  describe('with exodus_selectWallet', () => {
    it.each([
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: ['solana', ['exodus']],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: ['evm:0x1', ['exodus', 'metamask']],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: ['evm:0x1', []],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: ['evm:0x1', ['metamask']],
        id: '4e29201b-81df-4abd-92e3-6dbd35ade1eb',
      },
    ])('should pass validation', (request) => {
      const result = validateRequest(request)
      expect(result).toEqual(request)
    })

    it.each([
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: ['solana', 'exodus'],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: [undefined, 100000],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: [{}, []],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: [],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: [null, ['exodus']],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
      {
        jsonrpc: '2.0',
        method: 'exodus_selectWallet',
        params: [[], ['exodus']],
        id: '3d748fba-2f33-410d-9ab3-3272a7cc0d25',
      },
    ])('should fail validation', (request) => {
      expect(() => validateRequest(request)).toThrow(/JSON validation failed/)
    })
  })
})
