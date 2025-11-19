#!/usr/bin/env node

/**
 * Script to update config.js with deployed contract addresses
 * Run this after deploying contracts: node update-config.js
 */

const fs = require('fs');
const path = require('path');

// Path to deployment JSON (from contracts project)
// Will auto-detect chain ID from deployment file
const deploymentPath = path.join(__dirname, '../wingFi-contracts/deployments/123123.json');
const configPath = path.join(__dirname, 'config.js');

async function updateConfig() {
  try {
    console.log('📝 Updating extension config with deployed contracts...\n');
    
    // Read deployment JSON
    if (!fs.existsSync(deploymentPath)) {
      console.error('❌ Deployment file not found:', deploymentPath);
      console.log('Please deploy contracts first: cd ../wingFi-contracts && ./script/deploy.sh');
      process.exit(1);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    console.log('✅ Loaded deployment data for chain ID:', deployment.chainId);
    console.log('📦 Contracts found:');
    console.log('  - Stablecoin:', deployment.contracts.Stablecoin.address);
    console.log('  - PolicyNFT:', deployment.contracts.PolicyNFT.address);
    console.log('  - GlobalPool:', deployment.contracts.GlobalPool.address);
    console.log('  - PoolManager:', deployment.contracts.PoolManager.address);
    console.log('  - OracleAdapter:', deployment.contracts.OracleAdapter.address);
    console.log('  - Airline Pools:', Object.keys(deployment.contracts.AirlinePools).length);
    
    // Create embedded config
    const configContent = `// Configuration for AeroFi Extension - Contract addresses and ABIs
// Auto-generated from deployment data

const CONFIG = {
  // Network Configuration (auto-detected)
  CHAIN_ID: ${deployment.chainId},
  CHAIN_NAME: '${deployment.chainId === 123123 ? 'Rayls Testnet' : 'Unknown Network'}',
  RPC_URL: '${deployment.chainId === 123123 ? 'https://devnet-rpc.rayls.com' : ''}',
  EXPLORER_URL: '${deployment.chainId === 123123 ? 'https://devnet-explorer.rayls.com' : ''}',
  
  // Contract addresses
  CONTRACTS: {
    STABLECOIN: '${deployment.contracts.Stablecoin.address}',
    POLICY_NFT: '${deployment.contracts.PolicyNFT.address}',
    GLOBAL_POOL: '${deployment.contracts.GlobalPool.address}',
    POOL_MANAGER: '${deployment.contracts.PoolManager.address}',
    ORACLE_ADAPTER: '${deployment.contracts.OracleAdapter.address}',
    AIRLINE_POOLS: ${JSON.stringify(
      Object.entries(deployment.contracts.AirlinePools).reduce((acc, [code, pool]) => {
        acc[code] = pool.address;
        return acc;
      }, {}),
      null,
      6
    )}
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
  ABIS: ${JSON.stringify({
    ERC20: deployment.contracts.Stablecoin.abi.filter(item => 
      ['approve', 'allowance', 'balanceOf'].includes(item.name)
    ),
    POOL_MANAGER: deployment.contracts.PoolManager.abi.filter(item =>
      ['getGlobalPool', 'getAirlinePool', 'createCrowdFillPool'].includes(item.name)
    ),
    GLOBAL_POOL: deployment.contracts.GlobalPool.abi.filter(item =>
      ['collectPremium', 'deposit', 'withdraw', 'getPoolTVL', 'getLPBalance'].includes(item.name)
    ),
    AIRLINE_POOL: deployment.contracts.GlobalPool.abi.filter(item =>
      ['collectPremium', 'deposit', 'withdraw', 'getPoolTVL', 'getLPBalance'].includes(item.name)
    ),
    POLICY_NFT: deployment.contracts.PolicyNFT.abi.filter(item =>
      ['mintPolicy', 'balanceOf', 'tokenOfOwnerByIndex'].includes(item.name)
    )
  }, null, 2)}
};

// No need to load dynamically - all data is embedded
console.log('AeroFi Extension: Config loaded with', Object.keys(CONFIG.CONTRACTS.AIRLINE_POOLS).length, 'airline pools');
`;
    
    // Write config file
    fs.writeFileSync(configPath, configContent);
    
    console.log('\n✅ Config file updated successfully!');
    console.log('📍 Location:', configPath);
    console.log('\n🎉 Extension is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable Developer Mode');
    console.log('3. Click "Load unpacked" and select the wingFi-extension folder');
    console.log('4. Open mock-booking-site/index.html to test\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateConfig();

