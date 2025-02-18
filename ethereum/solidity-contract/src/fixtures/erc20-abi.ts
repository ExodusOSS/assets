export default JSON.parse(`
[
   {
      "name" : "approve",
      "payable" : false,
      "type" : "function",
      "stateMutability" : "nonpayable",
      "constant" : false,
      "inputs" : [
         {
            "name" : "spender",
            "type" : "address"
         },
         {
            "type" : "uint256",
            "name" : "tokens"
         }
      ],
      "outputs" : [
         {
            "type" : "bool",
            "name" : "success"
         }
      ]
   },
   {
      "constant" : true,
      "type" : "function",
      "stateMutability" : "view",
      "inputs" : [],
      "outputs" : [
         {
            "type" : "uint256",
            "name" : ""
         }
      ],
      "payable" : false,
      "name" : "totalSupply"
   },
   {
      "inputs": [],
      "name": "name",
      "outputs": [{ "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{ "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
   {
      "payable" : false,
      "outputs" : [
         {
            "name" : "success",
            "type" : "bool"
         }
      ],
      "constant" : false,
      "type" : "function",
      "stateMutability" : "nonpayable",
      "inputs" : [
         {
            "name" : "from",
            "type" : "address"
         },
         {
            "name" : "to",
            "type" : "address"
         },
         {
            "name" : "tokens",
            "type" : "uint256"
         }
      ],
      "name" : "transferFrom"
   },
   {
      "payable" : false,
      "type" : "function",
      "constant" : true,
      "stateMutability" : "view",
      "inputs" : [
         {
            "type" : "address",
            "name" : "tokenOwner"
         }
      ],
      "outputs" : [
         {
            "type" : "uint256",
            "name" : "balance"
         }
      ],
      "name" : "balanceOf"
   },
   {
      "payable" : false,
      "outputs" : [
         {
            "type" : "bool",
            "name" : "success"
         }
      ],
      "stateMutability" : "nonpayable",
      "type" : "function",
      "constant" : false,
      "inputs" : [
         {
            "name" : "to",
            "type" : "address"
         },
         {
            "name" : "tokens",
            "type" : "uint256"
         }
      ],
      "name" : "transfer"
   },
   {
      "name" : "allowance",
      "payable" : false,
      "type" : "function",
      "stateMutability" : "view",
      "constant" : true,
      "inputs" : [
         {
            "type" : "address",
            "name" : "tokenOwner"
         },
         {
            "name" : "spender",
            "type" : "address"
         }
      ],
      "outputs" : [
         {
            "type" : "uint256",
            "name" : "remaining"
         }
      ]
   },
   {
      "anonymous" : false,
      "name" : "Transfer",
      "type" : "event",
      "inputs" : [
         {
            "name" : "from",
            "indexed" : true,
            "type" : "address"
         },
         {
            "name" : "to",
            "indexed" : true,
            "type" : "address"
         },
         {
            "name" : "tokens",
            "type" : "uint256",
            "indexed" : false
         }
      ]
   },
   {
      "inputs" : [
         {
            "type" : "address",
            "indexed" : true,
            "name" : "tokenOwner"
         },
         {
            "name" : "spender",
            "indexed" : true,
            "type" : "address"
         },
         {
            "name" : "tokens",
            "indexed" : false,
            "type" : "uint256"
         }
      ],
      "type" : "event",
      "anonymous" : false,
      "name" : "Approval"
   }
]
`)
