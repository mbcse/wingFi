const fs = require('fs');
const path = require('path');

// Rayls Testnet deployment
const source = path.join(__dirname, '../../wingFi-contracts/deployments/123123.json');
const dest = path.join(__dirname, '../lib/deployment.json');

try {
  const data = fs.readFileSync(source, 'utf8');
  fs.writeFileSync(dest, data);
  console.log('✅ Deployment file copied successfully to lib/deployment.json (Rayls Testnet - Chain ID: 123123)');
} catch (error) {
  console.error('❌ Error copying deployment file:', error.message);
  console.error('Make sure contracts are deployed to Rayls Testnet first!');
  process.exit(1);
}

