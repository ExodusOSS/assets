declare module '@exodus/crypto/keccak' {
  export function keccak256(data: Buffer | string): Buffer
}

declare module '@exodus/ethereumjs/util' {
  export function toBuffer(data: unknown): Buffer
  export function bufferToHex(data: Buffer): string
}
