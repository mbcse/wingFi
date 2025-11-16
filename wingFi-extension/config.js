// Configuration for WingFi Extension - Contract addresses and ABIs
// Auto-generated from deployment data

const CONFIG = {
  // BSC Testnet
  CHAIN_ID: 97,
  CHAIN_NAME: 'BSC Testnet',
  RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  EXPLORER_URL: 'https://testnet.bscscan.com',
  
  // Contract addresses
  CONTRACTS: {
    STABLECOIN: '0x3c4f65d01eae7423c681398125ef19810a7ce45f',
    POLICY_NFT: '0x95f451f60a303a321a8b6033e36a635d39fdaac8',
    GLOBAL_POOL: '0xb3e71b55c5faebba2c78b100f3629d7797c7ffdb',
    POOL_MANAGER: '0x4cf1aa7e7be67dc0391d67259ae495d7bc49c51b',
    ORACLE_ADAPTER: '0x63005f878bfb52df7c4481c09f3e895d6fd5960d',
    AIRLINE_POOLS: {
      "EK": "0x96917887dc7d146e3a2191405fa09ebf616fe4dd",
      "AI": "0x2efee936fe35feacaadc46909d6459a9b6915341",
      "QR": "0x4c417571d9602a894b129efa2fea6c9073d2736d",
      "DL": "0xd51b1d85b3fddfe52f2e49df877489ceb7aded94",
      "LH": "0x1d52ccded1d5c6c6f43ec61fd8132f0c23592bb8",
      "LX": "0xa8defb37c7af0f938f965e9a891790acfa7273f5",
      "TK": "0x6bc3fe427d51634e6c497b2a388efa4f8a830081",
      "6E": "0x2b72de0d64037dcfb74161b24e84dc75a8076a9f",
      "AA": "0xc63e000875655c9ed8fac47f5ea96c8986b7ad05",
      "BA": "0x2a2f488377ef8bec87d195d9ae795164150434be"
}
  },
  
  // Airline mappings
  AIRLINES: {
    'EK': { name: 'Emirates', code: 'EK' },
    'AI': { name: 'Air India', code: 'AI' },
    'QR': { name: 'Qatar Airways', code: 'QR' },
    'DL': { name: 'Delta', code: 'DL' },
    'LH': { name: 'Lufthansa', code: 'LH' },
    'LX': { name: 'Swiss', code: 'LX' },
    'TK': { name: 'Turkish Airlines', code: 'TK' },
    '6E': { name: 'IndiGo', code: '6E' },
    'AA': { name: 'American Airlines', code: 'AA' },
    'BA': { name: 'British Airways', code: 'BA' }
  },
  
  // Premium calculation (simplified - in production would come from oracle/API)
  PREMIUM_RATES: {
    GLOBAL: 0.05,      // 5% of coverage
    AIRLINE: 0.04,     // 4% of coverage (airline-specific)
    CROWDFILL: 0.035   // 3.5% of coverage (best rate)
  },
  
  // Contract ABIs (minimal - only functions we need)
  ABIS: {
  "ERC20": [
    {
      "type": "function",
      "name": "allowance",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "spender",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        {
          "name": "spender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "POOL_MANAGER": [
    {
      "type": "function",
      "name": "createCrowdFillPool",
      "inputs": [
        {
          "name": "policyOwner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "coverageRequired",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "premium",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "flightId",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "policyId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getAirlinePool",
      "inputs": [
        {
          "name": "airlineCode",
          "type": "string",
          "internalType": "string"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "GLOBAL_POOL": [
    {
      "type": "function",
      "name": "collectPremium",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "deposit",
      "inputs": [
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getLPBalance",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPoolTVL",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "withdraw",
      "inputs": [
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    }
  ],
  "AIRLINE_POOL": [
    {
      "type": "function",
      "name": "collectPremium",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "deposit",
      "inputs": [
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getLPBalance",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPoolTVL",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "withdraw",
      "inputs": [
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    }
  ],
  "POLICY_NFT": [
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "mintPolicy",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "flightId",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "pnr",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "poolType",
          "type": "uint8",
          "internalType": "uint8"
        },
        {
          "name": "coverageAmount",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "premiumPaid",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "expiryTimestamp",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "poolAddress",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "nonpayable"
    }
  ]
}
};

// No need to load dynamically - all data is embedded
console.log('WingFi Extension: Config loaded with', Object.keys(CONFIG.CONTRACTS.AIRLINE_POOLS).length, 'airline pools');
