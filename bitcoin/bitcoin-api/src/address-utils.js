import assert from 'minimalistic-assert'

export function isReceiveAddress(address) {
  return parsePath(address)[0] === 0
}

export function isChangeAddress(address) {
  return parsePath(address)[0] === 1
}

function parsePath(address) {
  assert(
    address.meta.path,
    `address parameter ${address} does not have a meta.path. Is it a valid Address object?`
  )
  const path = address.meta.path
  const p1 = path ? path.replace('m/', '').split('/') : ['0', '0']
  return p1.map((i) => parseInt(i, 10))
}
