const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../../wingFi-contracts/deployments/97.json');
const dest = path.join(__dirname, '../lib/deployment.json');

try {
  const data = fs.readFileSync(source, 'utf8');
  fs.writeFileSync(dest, data);
  console.log('✅ Deployment file copied successfully to lib/deployment.json');
} catch (error) {
  console.error('❌ Error copying deployment file:', error.message);
  process.exit(1);
}

