import {
  UserRejectedRequestError,
  UnauthorizedError,
  UnsupportedMethodError,
  DisconnectedError,
  InternalError,
  InvalidInputError,
  MethodNotFoundError,
} from './index.js'

describe('UserRejectedRequestError', () => {
  const err = new UserRejectedRequestError()

  it('has a code', () => {
    expect(err.code).toBe(4001)
  })

  it('has an explanation', () => {
    expect(err.message).toBe(
      'The user rejected the request through the wallet.',
    )
  })
})

describe('UnauthorizedError', () => {
  const err = new UnauthorizedError()

  it('has a code', () => {
    expect(err.code).toBe(4100)
  })

  it('has an explanation', () => {
    expect(err.message).toBe(
      'The requested method and/or account has not been authorized by the user.',
    )
  })
})

describe('UnsupportedMethodError', () => {
  const err = new UnsupportedMethodError()

  it('has a code', () => {
    expect(err.code).toBe(4200)
  })

  it('has an explanation', () => {
    expect(err.message).toBe(
      'The Provider does not support the requested method.',
    )
  })
})

describe('DisconnectedError', () => {
  const err = new DisconnectedError()

  it('has a code', () => {
    expect(err.code).toBe(4900)
  })

  it('has an explanation', () => {
    expect(err.message).toBe('The Provider is disconnected from all chains.')
  })
})

describe('InternalError', () => {
  const err = new InternalError()

  it('has a code', () => {
    expect(err.code).toBe(-32603)
  })

  it('has an explanation', () => {
    expect(err.message).toBe('Something went wrong within the wallet.')
  })
})

describe('InvalidInputError', () => {
  const err = new InvalidInputError()

  it('has a code', () => {
    expect(err.code).toBe(-32000)
  })

  it('has an explanation', () => {
    expect(err.message).toBe('Missing or invalid parameters.')
  })
})

describe('MethodNotFoundError', () => {
  const err = new MethodNotFoundError()

  it('has a code', () => {
    expect(err.code).toBe(-32601)
  })

  it('has an explanation', () => {
    expect(err.message).toBe(
      'The requested method is not recognized by the wallet.',
    )
  })
})
