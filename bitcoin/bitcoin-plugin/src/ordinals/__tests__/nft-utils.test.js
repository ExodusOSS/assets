import { isNftBrc20 } from '../nft-utils.js' // Update this import path accordingly

describe('isNftBrc20', () => {
  it('should return true if nft.isBrc20 is true', () => {
    const nft = { isBrc20: true }
    expect(isNftBrc20(nft)).toBe(true)
  })

  it('should return false if contentType does not start with "text/plain" or "application/json"', () => {
    const nft = { contentType: 'image/jpeg' }
    expect(isNftBrc20(nft)).toBe(false)
  })

  it('should return false if there is no contentBody', () => {
    const nft = { contentType: 'text/plain' }
    expect(isNftBrc20(nft)).toBe(false)
  })

  it('should return true if contentBody is a base64-encoded JSON with "p" key having value "brc-20"', () => {
    const json = { p: 'brc-20' }
    const base64 = Buffer.from(JSON.stringify(json)).toString('base64')
    const nft = { contentType: 'application/json', contentBody: base64 }
    expect(isNftBrc20(nft)).toBe(true)
  })

  it('should handle case insensitivity for the "p" key value', () => {
    const json = { p: 'BRC-20' }
    const base64 = Buffer.from(JSON.stringify(json)).toString('base64')
    const nft = { contentType: 'application/json', contentBody: base64 }
    expect(isNftBrc20(nft)).toBe(true)
  })

  it('should return false if contentBody is not a valid JSON', () => {
    const base64 = Buffer.from('{ invalid_json }').toString('base64')
    const nft = { contentType: 'application/json', contentBody: base64 }
    expect(isNftBrc20(nft)).toBe(false)
  })

  it('should return false if "p" key in contentBody JSON does not have value "brc-20"', () => {
    const json = { p: 'other-value' }
    const base64 = Buffer.from(JSON.stringify(json)).toString('base64')
    const nft = { contentType: 'application/json', contentBody: base64 }
    expect(isNftBrc20(nft)).toBe(false)
  })
})
