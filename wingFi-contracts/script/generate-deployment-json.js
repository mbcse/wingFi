const fs = require('fs');
const path = require('path');

const chainId = process.env.CHAIN_ID || '97'; // Default to BSC testnet
const deploymentsDir = path.join(__dirname, '../deployments');
const outDir = path.join(__dirname, '../out');

if (!fs.existsSync(deploymentsDir)) {
  fs.mkdirSync(deploymentsDir, { recursive: true });
}

function readABI(contractName) {
  const abiPath = path.join(outDir, `${contractName}.sol`, `${contractName}.json`);
  if (fs.existsSync(abiPath)) {
    const content = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    return content.abi || [];
  }
  return [];
}

function generateDeploymentJson(deploymentInfo) {
  const deployment = {
    chainId: parseInt(chainId),
    deployer: deploymentInfo.deployer || '',
    contracts: {
      Stablecoin: {
        address: deploymentInfo.stablecoin,
        abi: readABI('MockERC20')
      },
      PolicyNFT: {
        address: deploymentInfo.policyNFT,
        abi: readABI('PolicyNFT')
      },
      GlobalPool: {
        address: deploymentInfo.globalPool,
        abi: readABI('GlobalPool')
      },
      OracleAdapter: {
        address: deploymentInfo.oracleAdapter,
        abi: readABI('OracleAdapter')
      },
      PoolManager: {
        address: deploymentInfo.poolManager,
        abi: readABI('PoolManager')
      },
      AirlinePools: {}
    }
  };

  if (deploymentInfo.airlinePools) {
    // Map airline codes to names
    const airlineMap = {
      'EK': 'Emirates',
      'AI': 'Air India',
      'QR': 'Qatar Airways',
      'DL': 'Delta Airlines',
      'LH': 'Lufthansa',
      'LX': 'Swiss Airlines',
      'TK': 'Turkish Airlines',
      '6E': 'Indigo',
      'AA': 'American Airlines',
      'BA': 'British Airways'
    };
    
    deploymentInfo.airlinePools.forEach((pool) => {
      // Handle both object format {code, address} and string format (address only)
      const airlineCode = typeof pool === 'object' ? pool.code : null;
      const poolAddress = typeof pool === 'object' ? pool.address : pool;
      
      if (airlineCode && airlineMap[airlineCode]) {
        deployment.contracts.AirlinePools[airlineCode] = {
          name: airlineMap[airlineCode],
          code: airlineCode,
          address: poolAddress,
          abi: readABI('AirlinePool')
        };
      }
    });
  }

  return deployment;
}

if (require.main === module) {
  let deploymentInfo = {};
  
  // Try to parse from environment variable
  if (process.env.DEPLOYMENT_INFO) {
    try {
      deploymentInfo = JSON.parse(process.env.DEPLOYMENT_INFO);
    } catch (e) {
      console.error('Error parsing DEPLOYMENT_INFO:', e.message);
    }
  }
  
  // Or try to get from command line arguments
  if (process.argv.length > 2) {
    const args = process.argv.slice(2);
    if (args[0] === '--addresses') {
      // Format: --addresses stablecoin=0x... policyNFT=0x... etc
      args.slice(1).forEach(arg => {
        const [key, value] = arg.split('=');
        if (key && value) {
          deploymentInfo[key] = value;
        }
      });
    } else if (args[0].endsWith('.json')) {
      // Read from JSON file
      try {
        const fileContent = fs.readFileSync(args[0], 'utf8');
        deploymentInfo = JSON.parse(fileContent);
      } catch (e) {
        console.error('Error reading JSON file:', e.message);
        process.exit(1);
      }
    }
  }
  
  // Validate required addresses
  const required = ['stablecoin', 'policyNFT', 'globalPool', 'oracleAdapter', 'poolManager'];
  const missing = required.filter(key => !deploymentInfo[key]);
  
  if (missing.length > 0) {
    console.error('Missing required addresses:', missing.join(', '));
    console.log('\nUsage:');
    console.log('  CHAIN_ID=56 DEPLOYMENT_INFO=\'{"stablecoin":"0x...",...}\' node script/generate-deployment-json.js');
    console.log('  OR');
    console.log('  node script/generate-deployment-json.js --addresses stablecoin=0x... policyNFT=0x...');
    console.log('  OR');
    console.log('  node script/generate-deployment-json.js deployment-info.json');
    process.exit(1);
  }
  
  const deployment = generateDeploymentJson(deploymentInfo);
  const outputPath = path.join(deploymentsDir, `${chainId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));
  console.log(`✅ Deployment JSON written to: ${outputPath}`);
  console.log(`   Chain ID: ${chainId}`);
  console.log(`   Contracts: ${Object.keys(deployment.contracts).length}`);
}

module.exports = { generateDeploymentJson, readABI };

