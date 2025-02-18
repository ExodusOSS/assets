export type HexOrBuffer = string | Buffer

export interface ABISpec {
  name: string // method/event name
  type: string // Indicates if event or method
  inputs: Array<{ name; type } | ABITuple> // method input params
  outputs: Array<{ name; type }> // method return values
}

export interface ABITuple {
  name: string
  type: 'tuple'
  components: Array<{ name; type }>
}

export interface ABIImplementation {
  build: (...any) => Buffer
  parse: (HexOrBuffer) => Array<any>
  testInput: (HexOrBuffer) => boolean
  abi: ABISpec
}
