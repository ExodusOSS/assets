import createValidator from '../src/validations/createValidator.js'
import globalValidations from '../src/validations/global-validations.js'

test('Can create all global validations', () => {
  expect(globalValidations).toBeDefined()
  // validates all are ok
  expect(globalValidations.map(createValidator)).toBeDefined()
})

describe('SEND_RESERVE_WARN validator', () => {
  let sendReserveValidator

  beforeEach(() => {
    sendReserveValidator = globalValidations.find((v) => v.id === 'SEND_RESERVE_WARN')
  })

  it('should have correct properties', () => {
    expect(sendReserveValidator).toBeDefined()
    expect(sendReserveValidator.id).toBe('SEND_RESERVE_WARN')
    expect(sendReserveValidator.type).toBe(1) // VALIDATION_TYPES.WARN
    expect(sendReserveValidator.field).toBe('amount')
    expect(sendReserveValidator.validateAndGetMessage).toBeDefined()
  })

  describe('validateAndGetMessage', () => {
    const mockAsset = {
      displayName: 'Algorand',
      displayTicker: 'ALGO',
      accountDeleteFee: {
        toDefaultString: () => '0.001',
      },
      baseAsset: {
        address: {
          validate: jest.fn(),
        },
      },
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return undefined when sendReserveInfo.canSend is false', async () => {
      const result = await sendReserveValidator.validateAndGetMessage({
        sendReserveInfo: { canSend: false },
        destinationAddress: 'some-address',
        asset: mockAsset,
      })
      expect(result).toBeUndefined()
      expect(mockAsset.baseAsset.address.validate).not.toHaveBeenCalled()
    })

    it('should return undefined when sendReserveInfo is null', async () => {
      const result = await sendReserveValidator.validateAndGetMessage({
        sendReserveInfo: null,
        destinationAddress: 'some-address',
        asset: mockAsset,
      })
      expect(result).toBeUndefined()
      expect(mockAsset.baseAsset.address.validate).not.toHaveBeenCalled()
    })

    it('should return undefined when sendReserveInfo is undefined', async () => {
      const result = await sendReserveValidator.validateAndGetMessage({
        sendReserveInfo: undefined,
        destinationAddress: 'some-address',
        asset: mockAsset,
      })
      expect(result).toBeUndefined()
      expect(mockAsset.baseAsset.address.validate).not.toHaveBeenCalled()
    })

    it('should return undefined when destination address is invalid', async () => {
      mockAsset.baseAsset.address.validate.mockResolvedValue(false)

      const result = await sendReserveValidator.validateAndGetMessage({
        sendReserveInfo: { canSend: true },
        destinationAddress: 'invalid-address',
        asset: mockAsset,
      })

      expect(result).toBeUndefined()
      expect(mockAsset.baseAsset.address.validate).toHaveBeenCalledWith('invalid-address')
    })

    it('should return warning message when destination address is valid', async () => {
      mockAsset.baseAsset.address.validate.mockResolvedValue(true)

      const result = await sendReserveValidator.validateAndGetMessage({
        sendReserveInfo: { canSend: true },
        destinationAddress: 'valid-address',
        asset: mockAsset,
      })

      expect(result).toEqual(
        'The Algorand network has built-in rules on minimum balances, to send your remaining balance the Algorand network will charge a 0.001 ALGO fee.'
      )
      expect(mockAsset.baseAsset.address.validate).toHaveBeenCalledWith('valid-address')
    })
  })
})
