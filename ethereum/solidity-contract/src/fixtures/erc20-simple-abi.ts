export default JSON.parse(`
[
  {
     "inputs" : [
        {
           "type" : "address",
           "name" : "src"
        }
     ],
     "name" : "balanceOf",
     "stateMutability" : "view",
     "type" : "function",
     "outputs" : [
        {
           "name" : "",
           "type" : "uint256"
        }
     ],
     "payable" : false,
     "constant" : true
  },
  {
     "payable" : false,
     "constant" : false,
     "outputs" : [
        {
           "type" : "bool",
           "name" : ""
        }
     ],
     "inputs" : [
        {
           "name" : "dst",
           "type" : "address"
        },
        {
           "name" : "wad",
           "type" : "uint256"
        }
     ],
     "name" : "transfer",
     "stateMutability" : "nonpayable",
     "type" : "function"
  },
  {
     "anonymous" : false,
     "name" : "Transfer",
     "inputs" : [
        {
           "type" : "address",
           "indexed" : true,
           "name" : "src"
        },
        {
           "indexed" : true,
           "name" : "dst",
           "type" : "address"
        },
        {
           "indexed" : false,
           "name" : "wad",
           "type" : "uint256"
        }
     ],
     "type" : "event"
  }
]
`)
