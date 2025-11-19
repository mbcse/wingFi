#!/bin/bash

# Deploy AeroFi to Rayls Testnet
# Chain ID: 123123
# RPC: https://devnet-rpc.rayls.com
# Explorer: https://devnet-explorer.rayls.com

set -e

echo "========================================="
echo "🚀 AeroFi Deployment to Rayls Testnet"
echo "========================================="
echo ""

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set"
    echo "Please set it: export PRIVATE_KEY=your_private_key"
    exit 1
fi

# Network configuration
CHAIN_ID=123123
RPC_URL="https://devnet-rpc.rayls.com"
EXPLORER_URL="https://devnet-explorer.rayls.com"

echo "📋 Network Details:"
echo "   Chain ID: $CHAIN_ID"
echo "   RPC URL: $RPC_URL"
echo "   Explorer: $EXPLORER_URL"
echo ""

# Deploy contracts
echo "🔨 Deploying contracts..."
echo ""

forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $RPC_URL \
    --chain-id $CHAIN_ID \
    --broadcast \
    --legacy \
    -vvvv

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""

# Generate deployment JSON
echo "📝 Generating deployment JSON..."
echo ""

CHAIN_ID=$CHAIN_ID node script/extract-addresses.js
node script/generate-deployment-json.js

# Copy to frontend and extension
echo ""
echo "📋 Copying deployment data..."
echo ""

# Create deployments directory if it doesn't exist
mkdir -p deployments

# Copy to frontend
if [ -d "../wingFi" ]; then
    mkdir -p ../wingFi/lib/web3/deployments
    cp deployments/${CHAIN_ID}.json ../wingFi/lib/web3/deployments/
    cp deployments/${CHAIN_ID}.json ../wingFi/deployment.json
    echo "✅ Copied to frontend: wingFi/lib/web3/deployments/${CHAIN_ID}.json"
fi

# Copy to extension
if [ -d "../wingFi-extension" ]; then
    mkdir -p ../wingFi-extension/deployments
    cp deployments/${CHAIN_ID}.json ../wingFi-extension/deployments/
    echo "✅ Copied to extension: wingFi-extension/deployments/${CHAIN_ID}.json"
fi

echo ""
echo "========================================="
echo "🎉 All Done! Next Steps:"
echo "========================================="
echo ""
echo "1. Update frontend Web3 config to use Chain ID: $CHAIN_ID"
echo "2. Update extension to use Chain ID: $CHAIN_ID"
echo "3. Add Rayls Testnet to MetaMask:"
echo "   - Network Name: Rayls Testnet"
echo "   - RPC URL: $RPC_URL"
echo "   - Chain ID: $CHAIN_ID"
echo "   - Currency Symbol: USDgas"
echo "   - Explorer: $EXPLORER_URL"
echo ""
echo "4. Get testnet tokens from Rayls faucet"
echo "5. Start the frontend: cd ../wingFi && npm run dev"
echo ""
echo "📜 Contract addresses saved to: deployments/${CHAIN_ID}.json"
echo ""

