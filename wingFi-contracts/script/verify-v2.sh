#!/bin/bash

# BSCScan Verification using Foundry with API V2 support
# Requires Foundry v1.2.0+

set -e

echo "🔍 Verifying contracts on BSCScan (API V2)..."
echo ""

# Check for API key
if [ -z "$BSCSCAN_API_KEY" ]; then
    echo "❌ Error: BSCSCAN_API_KEY not set"
    echo ""
    echo "Run: export BSCSCAN_API_KEY='DNZSARZ6UXVC1SMRDTFFZ8K4FNRRGM98WW'"
    exit 1
fi

# Contract addresses
STABLECOIN="0x3c4f65d01eae7423c681398125ef19810a7ce45f"
POLICY_NFT="0x95f451f60a303a321a8b6033e36a635d39fdaac8"
GLOBAL_POOL="0xb3e71b55c5faebba2c78b100f3629d7797c7ffdb"
ORACLE_ADAPTER="0x63005f878bfb52df7c4481c09f3e895d6fd5960d"
POOL_MANAGER="0x4cf1aa7e7be67dc0391d67259ae495d7bc49c51b"

echo "📋 Contracts:"
echo "  Stablecoin:     $STABLECOIN"
echo "  PolicyNFT:      $POLICY_NFT"
echo "  GlobalPool:     $GLOBAL_POOL"
echo "  OracleAdapter:  $ORACLE_ADAPTER"
echo "  PoolManager:    $POOL_MANAGER"
echo ""

# Use chain-id 97 for BSC Testnet
echo "📝 Verifying Stablecoin..."
forge verify-contract $STABLECOIN \
    src/mocks/MockERC20.sol:MockERC20 \
    --chain-id 97 \
    --verifier etherscan \
    --etherscan-api-key $BSCSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(string,string)" "USD Coin" "USDC") \
    --watch || echo "⚠️  Skipped"
echo ""

echo "📝 Verifying PolicyNFT..."
forge verify-contract $POLICY_NFT \
    src/PolicyNFT.sol:PolicyNFT \
    --chain-id 97 \
    --verifier etherscan \
    --etherscan-api-key $BSCSCAN_API_KEY \
    --watch || echo "⚠️  Skipped"
echo ""

echo "📝 Verifying GlobalPool..."
forge verify-contract $GLOBAL_POOL \
    src/GlobalPool.sol:GlobalPool \
    --chain-id 97 \
    --verifier etherscan \
    --etherscan-api-key $BSCSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address)" $STABLECOIN) \
    --watch || echo "⚠️  Skipped"
echo ""

echo "📝 Verifying OracleAdapter..."
forge verify-contract $ORACLE_ADAPTER \
    src/OracleAdapter.sol:OracleAdapter \
    --chain-id 97 \
    --verifier etherscan \
    --etherscan-api-key $BSCSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address,address)" $POOL_MANAGER $POLICY_NFT) \
    --watch || echo "⚠️  Skipped"
echo ""

echo "📝 Verifying PoolManager..."
forge verify-contract $POOL_MANAGER \
    src/PoolManager.sol:PoolManager \
    --chain-id 97 \
    --verifier etherscan \
    --etherscan-api-key $BSCSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address,address,address,address)" $STABLECOIN $GLOBAL_POOL $POLICY_NFT $ORACLE_ADAPTER) \
    --watch || echo "⚠️  Skipped"
echo ""

echo "✅ Verification complete!"
echo ""
echo "📝 View on BSCScan:"
echo "  Stablecoin:    https://testnet.bscscan.com/address/$STABLECOIN#code"
echo "  PolicyNFT:     https://testnet.bscscan.com/address/$POLICY_NFT#code"
echo "  GlobalPool:    https://testnet.bscscan.com/address/$GLOBAL_POOL#code"
echo "  OracleAdapter: https://testnet.bscscan.com/address/$ORACLE_ADAPTER#code"
echo "  PoolManager:   https://testnet.bscscan.com/address/$POOL_MANAGER#code"

