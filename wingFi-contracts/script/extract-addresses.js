const fs = require('fs');
const path = require('path');

// Try to extract addresses from Foundry broadcast log
function extractFromBroadcastLog(chainId) {
  const broadcastLog = path.join(__dirname, `../broadcast/Deploy.s.sol/${chainId}/run-latest.json`);
  
  if (!fs.existsSync(broadcastLog)) {
    return null;
  }

  try {
    const content = JSON.parse(fs.readFileSync(broadcastLog, 'utf8'));
    const addresses = {};
    
    // Foundry broadcast log structure: transactions array with contractAddress
    if (content.transactions) {
      content.transactions.forEach((tx, index) => {
        if (tx.contractAddress && tx.contractName) {
          const contractName = tx.contractName.toLowerCase();
          
          // Map contract names to our keys
          if (contractName === 'mockerc20') {
            addresses.stablecoin = tx.contractAddress;
          } else if (contractName === 'policynft') {
            addresses.policyNFT = tx.contractAddress;
          } else if (contractName === 'globalpool') {
            addresses.globalPool = tx.contractAddress;
          } else if (contractName === 'oracleadapter') {
            addresses.oracleAdapter = tx.contractAddress;
          } else if (contractName === 'poolmanager') {
            addresses.poolManager = tx.contractAddress;
          } else if (contractName === 'airlinepool') {
            // Store airline pools with code from arguments
            if (!addresses.airlinePools) {
              addresses.airlinePools = [];
            }
            // Airline code is the 3rd argument (index 2) in the constructor
            const airlineCode = tx.arguments && tx.arguments.length > 2 ? tx.arguments[2] : null;
            addresses.airlinePools.push({
              code: airlineCode,
              address: tx.contractAddress
            });
          }
        }
      });
    }
    
    return addresses;
  } catch (e) {
    console.error('Error parsing broadcast log:', e.message);
    return null;
  }
}

// Extract from console log file
function extractFromLogFile(logFile) {
  if (!fs.existsSync(logFile)) {
    return null;
  }

  const logContent = fs.readFileSync(logFile, 'utf8');
  const addresses = {};
  
  // Patterns to match console.log output
  const patterns = {
    stablecoin: /MockERC20.*deployed.*at:.*?(0x[a-fA-F0-9]{40})/i,
    policyNFT: /PolicyNFT.*deployed.*at:.*?(0x[a-fA-F0-9]{40})/i,
    globalPool: /GlobalPool.*deployed.*at:.*?(0x[a-fA-F0-9]{40})/i,
    oracleAdapter: /OracleAdapter.*deployed.*at:.*?(0x[a-fA-F0-9]{40})/i,
    poolManager: /PoolManager.*deployed.*at:.*?(0x[a-fA-F0-9]{40})/i,
  };
  
  Object.keys(patterns).forEach(key => {
    const match = logContent.match(patterns[key]);
    if (match) {
      addresses[key] = match[1];
    }
  });
  
  // Extract airline pools
  const airlineNames = [
    'Emirates', 'Air India', 'Qatar Airways', 'Delta Airlines', 'Lufthansa',
    'Swiss Airlines', 'Turkish Airlines', 'Indigo', 'American Airlines', 'British Airways'
  ];
  
  addresses.airlinePools = [];
  airlineNames.forEach(name => {
    const pattern = new RegExp(`${name}.*Address:.*?(0x[a-fA-F0-9]{40})`, 'i');
    const match = logContent.match(pattern);
    if (match) {
      addresses.airlinePools.push(match[1]);
    }
  });
  
  return addresses;
}

if (require.main === module) {
  const chainId = process.env.CHAIN_ID || '97';
  const logFile = process.argv[2] || '/tmp/wingfi-deploy.log';
  
  console.log('Extracting addresses from deployment logs...');
  
  // Try broadcast log first (most reliable)
  let addresses = extractFromBroadcastLog(chainId);
  
  // Fallback to log file
  if (!addresses || Object.keys(addresses).length === 0) {
    console.log('Trying to extract from log file...');
    addresses = extractFromLogFile(logFile);
  }
  
  if (addresses && Object.keys(addresses).length > 0) {
    console.log(JSON.stringify(addresses, null, 2));
  } else {
    console.error('Could not extract addresses. Please check deployment logs.');
    process.exit(1);
  }
}

module.exports = { extractFromBroadcastLog, extractFromLogFile };

