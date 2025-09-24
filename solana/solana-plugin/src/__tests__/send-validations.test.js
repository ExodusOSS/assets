import sendValidationModel from '@exodus/send-validation-model'
import { asset as meta } from '@exodus/solana-meta'

import sendValidationsFactory from '../send-validations.js'

const { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } = sendValidationModel

const asset = { ...meta, baseAsset: meta, feeAsset: meta }

describe('sendValidationsFactory', () => {
  const mockApi = {
    getAddressType: jest.fn(),
    getAddressMint: jest.fn(),
    getRentExemptionMinAmount: jest.fn(),
  }
  const assetName = asset.name

  const mockAssetClientInterface = {
    getAccountState: jest.fn(),
  }

  const sendValidations = sendValidationsFactory({
    api: mockApi,
    assetName,
    assetClientInterface: mockAssetClientInterface,
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('factory function', () => {
    test('returns array of validators', () => {
      expect(Array.isArray(sendValidations)).toBe(true)
      expect(sendValidations).toHaveLength(5)
    })

    test('all validators have required properties', () => {
      sendValidations.forEach((validator) => {
        expect(validator).toHaveProperty('id')
        expect(validator).toHaveProperty('type')
        expect(validator).toHaveProperty('priority')
        expect(validator).toHaveProperty('field')
        expect(typeof validator.id).toBe('string')
      })
    })
  })

  describe('solanaAddressTypeValidator', () => {
    const validator = sendValidations.find((v) => v.id === 'WRONG_ADDRESS_TYPE')

    test('has correct properties', () => {
      expect(validator.type).toBe(VALIDATION_TYPES.ERROR)
      expect(validator.field).toBe(FIELDS.ADDRESS)
      expect(validator.priority).toBe(PRIORITY_LEVELS.BASE)
    })

    test('returns undefined when no destination address', async () => {
      const result = await validator.validateAndGetMessage({
        asset,
        destinationAddress: '',
      })

      expect(result).toBeUndefined()
      expect(mockApi.getAddressType).not.toHaveBeenCalled()
    })

    test('returns undefined when address type is not token', async () => {
      mockApi.getAddressType.mockResolvedValue('solana')
      mockApi.getAddressMint.mockResolvedValue(null)

      const result = await validator.validateAndGetMessage({
        asset,
        destinationAddress: 'validAddress',
      })

      expect(result).toBeUndefined()
    })

    test('returns error when destination is token address', async () => {
      mockApi.getAddressType.mockResolvedValue('token')
      mockApi.getAddressMint.mockResolvedValue('mintAddress')

      const result = await validator.validateAndGetMessage({
        asset,
        destinationAddress: 'tokenAddress',
      })

      expect(result).toBe(
        "The Solana network doesn't allow sending SOL to a Token Account address."
      )
    })

    test('returns error when destination is token address sending token', async () => {
      mockApi.getAddressType.mockResolvedValue('token')
      mockApi.getAddressMint.mockResolvedValue('mintAddress')

      const result = await validator.validateAndGetMessage({
        asset: {
          assetType: 'SOLANA_TOKEN',
          baseAsset: asset,
          displayTicker: 'TOKEN',
        },
        destinationAddress: 'tokenAddress',
      })

      expect(result).toBe(
        "The Solana network doesn't allow sending TOKEN to a Token Account address."
      )
    })

    test('returns undefined when destination is SOL address', async () => {
      mockApi.getAddressType.mockResolvedValue('solana')
      mockApi.getAddressMint.mockResolvedValue(null)

      const result = await validator.validateAndGetMessage({
        asset,
        destinationAddress: 'solanaAddress',
      })

      expect(result).toBeUndefined()
    })
  })

  describe('solanaMintAddressValidator', () => {
    const validator = sendValidations.find((v) => v.id === 'ADDRESS_MINT_MISMATCH')

    test('has correct properties', () => {
      expect(validator.type).toBe(VALIDATION_TYPES.ERROR)
      expect(validator.field).toBe(FIELDS.ADDRESS)
      expect(validator.priority).toBe(PRIORITY_LEVELS.MIDDLE)
    })

    test('returns undefined when not SOLANA_TOKEN asset', async () => {
      const result = await validator.validateAndGetMessage({
        asset: { assetType: 'ETHEREUM_TOKEN' },
        destinationAddress: 'address',
      })

      expect(result).toBeUndefined()
      expect(mockApi.getAddressType).not.toHaveBeenCalled()
    })

    test('returns undefined when no destination address', async () => {
      const result = await validator.validateAndGetMessage({
        asset: { assetType: 'SOLANA_TOKEN' },
        destinationAddress: '',
      })

      expect(result).toBeUndefined()
    })

    test('returns undefined when mint address matches', async () => {
      mockApi.getAddressType.mockResolvedValue('token')
      mockApi.getAddressMint.mockResolvedValue('tokenMintAddress1')

      const result = await validator.validateAndGetMessage({
        asset: {
          assetType: 'SOLANA_TOKEN',
          mintAddress: 'tokenMintAddress1',
          baseAsset: asset,
          displayTicker: 'TOKEN',
        },
        destinationAddress: 'tokenAddress1',
      })

      expect(result).toBeUndefined()
    })

    test('returns error when mint address mismatch', async () => {
      mockApi.getAddressType.mockResolvedValue('token')
      mockApi.getAddressMint.mockResolvedValue('differentMintAddress')

      const result = await validator.validateAndGetMessage({
        asset: {
          assetType: 'SOLANA_TOKEN',
          mintAddress: 'tokenMintAddress2',
          baseAsset: asset,
          displayTicker: 'TOKEN',
        },
        destinationAddress: 'tokenAddress2',
      })

      expect(result).toBe('Destination Wallet is not a Solana TOKEN address.')
    })

    test('returns undefined when target mint is null (uninitialized address)', async () => {
      mockApi.getAddressType.mockResolvedValue(null)
      mockApi.getAddressMint.mockResolvedValue(null)

      const result = await validator.validateAndGetMessage({
        asset: {
          assetType: 'SOLANA_TOKEN',
          mintAddress: 'tokenMintAddress',
          baseAsset: asset,
          displayTicker: 'TOKEN',
        },
        destinationAddress: 'uninitializedAddress',
      })

      expect(result).toBeUndefined()
    })
  })

  describe('solanaRentExemptAmountValidator', () => {
    const validator = sendValidations.find((v) => v.id === 'SOL_RENT_EXEMPT_AMOUNT')

    test('has correct properties', () => {
      expect(validator.type).toBe(VALIDATION_TYPES.ERROR)
      expect(validator.field).toBe(FIELDS.ADDRESS)
      expect(validator.priority).toBe(PRIORITY_LEVELS.MIDDLE)
    })

    test('should validate when sendAmount is provided', () => {
      const shouldValidate = validator.shouldValidate({
        asset,
        sendAmount: asset.currency.ZERO,
      })

      expect(shouldValidate).toBeTruthy()
    })

    test('should not validate when sendAmount is not provided', () => {
      const shouldValidate = validator.shouldValidate({
        asset,
        sendAmount: null,
      })

      expect(shouldValidate).toBeFalsy()
    })

    test('returns true when no destination address', async () => {
      const isValid = await validator.isValid({
        asset: {
          baseAsset: asset,
        },
        destinationAddress: '',
        sendAmount: null,
      })

      expect(isValid).toBe(true)
    })

    test('validates rent exemption for SOL sends', async () => {
      mockApi.getRentExemptionMinAmount.mockResolvedValue(100)

      const isValid = await validator.isValid({
        asset,
        destinationAddress: 'address',
        sendAmount: asset.currency.baseUnit(100),
      })

      expect(isValid).toBe(true)
    })

    test('validates rent exemption for token sends', async () => {
      mockApi.getRentExemptionMinAmount.mockResolvedValue(100)

      const isValid = await validator.isValid({
        asset: {
          name: 'token',
          baseAsset: asset,
          feeAsset: asset,
        },
        destinationAddress: 'address',
        sendAmount: asset.currency.baseUnit(100),
        baseAssetBalance: asset.currency.ZERO,
        feeAmount: asset.currency.ZERO,
      })

      expect(isValid).toBe(false)
    })

    test('returns hardcoded error message', () => {
      const message = validator.getMessage()
      expect(message).toBe('Amount too low. Send at least 0.002 SOL to cover network fees.')
    })
  })

  describe('solanaRentExemptAmountSenderValidator', () => {
    const validator = sendValidations.find((v) => v.id === 'SOL_RENT_EXEMPT_AMOUNT_SENDER')

    test('has correct properties', () => {
      expect(validator.type).toBe(VALIDATION_TYPES.ERROR)
      expect(validator.field).toBe(FIELDS.ADDRESS)
      expect(validator.priority).toBe(PRIORITY_LEVELS.MIDDLE)
      expect(validator.validateAndGetMessage).toBeDefined()
    })

    test('returns undefined when sendAmount is not provided', async () => {
      const result = await validator.validateAndGetMessage({
        asset,
        sendAmount: null,
        fees: { fee: asset.currency.baseUnit(100) },
        spendableBalance: asset.currency.baseUnit(100),
        fromWalletAccount: 'wallet-account-id',
      })

      expect(result).toBeUndefined()
      expect(mockAssetClientInterface.getAccountState).not.toHaveBeenCalled()
    })

    test('returns undefined when asset base name does not match', async () => {
      const result = await validator.validateAndGetMessage({
        asset: { baseAsset: { name: 'different-asset' } },
        sendAmount: asset.currency.baseUnit(100),
        fees: { fee: asset.currency.baseUnit(100) },
        spendableBalance: asset.currency.baseUnit(100),
        fromWalletAccount: 'wallet-account-id',
      })

      expect(result).toBeUndefined()
      expect(mockAssetClientInterface.getAccountState).not.toHaveBeenCalled()
    })

    test('returns undefined when fees are not provided', async () => {
      const result = await validator.validateAndGetMessage({
        asset,
        sendAmount: asset.currency.baseUnit(100),
        fees: null,
        spendableBalance: asset.currency.baseUnit(100),
        fromWalletAccount: 'wallet-account-id',
      })

      expect(result).toBeUndefined()
      expect(mockAssetClientInterface.getAccountState).not.toHaveBeenCalled()
    })

    test('returns undefined when spendableBalance is not provided', async () => {
      const result = await validator.validateAndGetMessage({
        asset,
        sendAmount: asset.currency.baseUnit(100),
        fees: { fee: asset.currency.baseUnit(100) },
        spendableBalance: null,
        fromWalletAccount: 'wallet-account-id',
      })

      expect(result).toBeUndefined()
      expect(mockAssetClientInterface.getAccountState).not.toHaveBeenCalled()
    })

    test('returns undefined when fromWalletAccount is not provided', async () => {
      const result = await validator.validateAndGetMessage({
        asset,
        sendAmount: asset.currency.baseUnit(100),
        fees: { fee: asset.currency.baseUnit(100) },
        spendableBalance: asset.currency.baseUnit(100),
        fromWalletAccount: null,
      })

      expect(result).toBeUndefined()
      expect(mockAssetClientInterface.getAccountState).not.toHaveBeenCalled()
    })

    test('returns undefined when accountState has no rentExemptAmount', async () => {
      mockAssetClientInterface.getAccountState.mockResolvedValue({})

      const result = await validator.validateAndGetMessage({
        asset,
        sendAmount: asset.currency.baseUnit(100),
        fees: { fee: asset.currency.baseUnit(100) },
        spendableBalance: asset.currency.baseUnit(100),
        fromWalletAccount: 'wallet-account-id',
      })

      expect(result).toBeUndefined()
      expect(mockAssetClientInterface.getAccountState).toHaveBeenCalledWith({
        assetName,
        walletAccount: 'wallet-account-id',
      })
    })

    test('returns undefined when remaining balance is zero', async () => {
      mockAssetClientInterface.getAccountState.mockResolvedValue({
        rentExemptAmount: asset.currency.baseUnit(10),
      })

      const result = await validator.validateAndGetMessage({
        asset,
        sendAmount: asset.currency.baseUnit(90),
        fees: { fee: asset.currency.baseUnit(10) },
        spendableBalance: asset.currency.baseUnit(100),
        fromWalletAccount: 'wallet-account-id',
      })

      expect(result).toBeUndefined()
      expect(mockAssetClientInterface.getAccountState).toHaveBeenCalledWith({
        assetName,
        walletAccount: 'wallet-account-id',
      })
    })

    test('returns undefined when remaining balance meets rent exemption', async () => {
      mockAssetClientInterface.getAccountState.mockResolvedValue({
        rentExemptAmount: asset.currency.baseUnit(10),
      })

      const result = await validator.validateAndGetMessage({
        asset,
        sendAmount: asset.currency.baseUnit(70),
        fees: { fee: asset.currency.baseUnit(10) },
        spendableBalance: asset.currency.baseUnit(100),
        fromWalletAccount: 'wallet-account-id',
      })

      expect(result).toBeUndefined()
      expect(mockAssetClientInterface.getAccountState).toHaveBeenCalledWith({
        assetName,
        walletAccount: 'wallet-account-id',
      })
    })

    test('returns error message when remaining balance is insufficient', async () => {
      mockAssetClientInterface.getAccountState.mockResolvedValue({
        rentExemptAmount: asset.currency.baseUnit(20),
      })

      const result = await validator.validateAndGetMessage({
        asset: { ...asset, displayTicker: 'SOL' },
        sendAmount: asset.currency.baseUnit(80),
        fees: { fee: asset.currency.baseUnit(5) },
        spendableBalance: asset.currency.baseUnit(100),
        fromWalletAccount: 'wallet-account-id',
      })

      expect(result).toBe(
        'You can either leave a zero balance, which will close your SOL account, or maintain a minimum balance of 0.00000002 SOL to keep it active.'
      )
      expect(mockAssetClientInterface.getAccountState).toHaveBeenCalledWith({
        assetName,
        walletAccount: 'wallet-account-id',
      })
    })
  })

  describe('solanaPayValidator', () => {
    const validator = sendValidations.find((v) => v.id === 'SOLANA_PAY')

    test('has correct properties', () => {
      expect(validator.type).toBe(VALIDATION_TYPES.ERROR)
      expect(validator.field).toBe(FIELDS.ADDRESS)
      expect(validator.priority).toBe(PRIORITY_LEVELS.MIDDLE)
    })

    test('should validate when solanaPayInfo has recipient', () => {
      const shouldValidate = validator.shouldValidate({
        solanaPayInfo: { recipient: 'recipient' },
      })

      expect(shouldValidate).toBe(true)
    })

    test('should validate when solanaPayInfo has link', () => {
      const shouldValidate = validator.shouldValidate({
        solanaPayInfo: { link: 'link' },
      })

      expect(shouldValidate).toBe(true)
    })

    test('should not validate when no solanaPayInfo', () => {
      const shouldValidate = validator.shouldValidate({
        solanaPayInfo: null,
      })

      expect(shouldValidate).toBe(false)
    })

    test('should not validate when solanaPayInfo is empty', () => {
      const shouldValidate = validator.shouldValidate({
        solanaPayInfo: {},
      })

      expect(shouldValidate).toBe(false)
    })

    test('returns false when solanaPayInfo has recipient', async () => {
      const isValid = await validator.isValid({
        solanaPayInfo: { recipient: 'recipient' },
      })

      expect(isValid).toBe(false)
    })

    test('returns false when solanaPayInfo has link', async () => {
      const isValid = await validator.isValid({
        solanaPayInfo: { link: 'link' },
      })

      expect(isValid).toBe(false)
    })

    test('returns true when no solanaPayInfo', async () => {
      const isValid = await validator.isValid({
        solanaPayInfo: {},
      })

      expect(isValid).toBe(true)
    })

    test('returns correct error message', () => {
      const message = validator.getMessage()
      expect(message).toBe('Please use Solana Pay feature to scan this QRCode.')
    })
  })

  describe('caching behavior', () => {
    test('caches getAccountInfo calls', async () => {
      const validator = sendValidations.find((v) => v.id === 'WRONG_ADDRESS_TYPE')
      const destinationAddress = 'testAddress'

      mockApi.getAddressType.mockResolvedValue('solana')
      mockApi.getAddressMint.mockResolvedValue(null)

      // First call
      await validator.validateAndGetMessage({
        asset,
        destinationAddress,
      })

      // Second call with same address
      await validator.validateAndGetMessage({
        asset,
        destinationAddress,
      })

      // Should only call API once due to caching
      expect(mockApi.getAddressType).toHaveBeenCalledTimes(1)
      expect(mockApi.getAddressMint).toHaveBeenCalledTimes(1)
    })

    test('makes separate calls for different addresses', async () => {
      const validator = sendValidations.find((v) => v.id === 'WRONG_ADDRESS_TYPE')

      mockApi.getAddressType.mockResolvedValue('solana')
      mockApi.getAddressMint.mockResolvedValue(null)

      // First call
      await validator.validateAndGetMessage({
        asset,
        destinationAddress: 'address1',
      })

      // Second call with different address
      await validator.validateAndGetMessage({
        asset,
        destinationAddress: 'address2',
      })

      // Should call API twice for different addresses
      expect(mockApi.getAddressType).toHaveBeenCalledTimes(2)
      expect(mockApi.getAddressMint).toHaveBeenCalledTimes(2)
    })
  })
})
