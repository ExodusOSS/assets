export function condenseAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
