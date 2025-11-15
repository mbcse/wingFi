#!/bin/bash

# WingFi Deployment Script
# This script deploys contracts and generates deployment JSON

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CHAIN_ID=${CHAIN_ID:-97}  # Default to BSC testnet (97)
RPC_URL=${RPC_URL:-""}
PRIVATE_KEY=${PRIVATE_KEY:-""}
GAS_PRICE=${GAS_PRICE:-""}  # Gas price in wei (leave empty for auto, or set e.g., 5000000000 for 5 gwei)
PRIORITY_FEE=${PRIORITY_FEE:-""}  # Priority fee (gas tip cap) in wei (leave empty for auto, or set e.g., 100000000 for 0.1 gwei)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}WingFi Contract Deployment${NC}"
echo -e "${BLUE}Chain ID: ${CHAIN_ID}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${YELLOW}Warning: PRIVATE_KEY not set. Please set it in your environment.${NC}"
    echo "Example: export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Ensure PRIVATE_KEY has 0x prefix for Foundry
if [[ ! "$PRIVATE_KEY" =~ ^0x ]]; then
    PRIVATE_KEY="0x$PRIVATE_KEY"
fi

# Build contracts first
echo -e "${GREEN}Step 1: Building contracts...${NC}"
forge build

# Deploy contracts
echo -e "\n${GREEN}Step 2: Deploying contracts...${NC}"

# Determine RPC URL based on chain ID
case $CHAIN_ID in
    56)
        RPC_URL=${RPC_URL:-"https://bsc-dataseed1.binance.org"}
        echo "Deploying to BSC Mainnet"
        ;;
    97)
        # BSC Testnet RPC endpoints (try in order if first fails)
        if [ -z "$RPC_URL" ]; then
            # Try QuickNode first (most reliable)
            RPC_URL="https://still-restless-dream.bsc-testnet.quiknode.pro/adcf48bef78d89e10a5d854bddbe45afc079d90a/"
        fi
        echo "Deploying to BSC Testnet"
        echo "Using RPC: $RPC_URL"
        echo ""
        echo "If this RPC fails, you can try these alternatives:"
        echo "  export RPC_URL=https://still-restless-dream.bsc-testnet.quiknode.pro/adcf48bef78d89e10a5d854bddbe45afc079d90a/"
        echo "  export RPC_URL=https://bnb-testnet.g.alchemy.com/v2/TuTdw1yo-RG6SW4OlV9onnahUbLBGXZF"
        echo "  export RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545"
        echo "  export RPC_URL=https://data-seed-prebsc-2-s1.binance.org:8545"
        echo "  export RPC_URL=https://bsc-testnet.publicnode.com"
        ;;
    31337|1337)
        RPC_URL=${RPC_URL:-"http://localhost:8545"}
        echo "Deploying to Local Network"
        ;;
    *)
        if [ -z "$RPC_URL" ]; then
            echo -e "${YELLOW}Warning: RPC_URL not set for chain ID ${CHAIN_ID}. Please set it.${NC}"
            exit 1
        fi
        ;;
esac

echo "Using RPC: $RPC_URL"

# Run deployment and capture output
echo "Running deployment script..."
# Try deployment with retry logic
MAX_RETRIES=3
RETRY_COUNT=0
DEPLOY_SUCCESS=false

# List of fallback RPCs for BSC testnet
FALLBACK_RPCS=(
    "https://bnb-testnet.g.alchemy.com/v2/TuTdw1yo-RG6SW4OlV9onnahUbLBGXZF"
    "https://data-seed-prebsc-1-s1.binance.org:8545"
    "https://data-seed-prebsc-2-s1.binance.org:8545"
    "https://bsc-testnet.publicnode.com"
)

CURRENT_RPC="$RPC_URL"

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$DEPLOY_SUCCESS" = false ]; do
    if [ $RETRY_COUNT -gt 0 ]; then
        echo -e "${YELLOW}Retry attempt $RETRY_COUNT of $MAX_RETRIES...${NC}"
        # Try next fallback RPC
        if [ $RETRY_COUNT -le ${#FALLBACK_RPCS[@]} ] && [ "$CHAIN_ID" = "97" ]; then
            CURRENT_RPC="${FALLBACK_RPCS[$((RETRY_COUNT-1))]}"
            echo "Trying fallback RPC: $CURRENT_RPC"
        fi
    fi
    
    echo "Deploying with RPC: $CURRENT_RPC"
    
    # Get current gas price for BSC testnet (in gwei)
    if [ "$CHAIN_ID" = "97" ]; then
        # BSC testnet typically needs higher gas price
        # BSC uses legacy transactions, so we only need gas-price, not priority-gas-price
        if [ -z "$GAS_PRICE" ]; then
            GAS_PRICE="5000000000"  # 5 gwei in wei (safe default, above minimum)
        fi
        
        # Convert wei to gwei for display (divide by 1e9)
        if command -v bc &> /dev/null; then
            GAS_PRICE_GWEI=$(echo "scale=2; $GAS_PRICE / 1000000000" | bc)
        else
            # Fallback: simple division (works for whole numbers)
            GAS_PRICE_GWEI=$((GAS_PRICE / 1000000000))
        fi
        echo "Using gas price: $GAS_PRICE wei ($GAS_PRICE_GWEI gwei)"
        # Don't set priority fee for BSC (uses legacy transactions)
        PRIORITY_FEE=""
    else
        GAS_PRICE=${GAS_PRICE:-""}
    fi
    
    # Build forge command with gas price if needed
    FORGE_CMD="PRIVATE_KEY=\"$PRIVATE_KEY\" forge script script/Deploy.s.sol:DeployScript --rpc-url \"$CURRENT_RPC\" --broadcast"
    
    # BSC uses legacy transactions, so force legacy format
    if [ "$CHAIN_ID" = "97" ] || [ "$CHAIN_ID" = "56" ]; then
        FORGE_CMD="$FORGE_CMD --legacy"
    fi
    
    if [ ! -z "$GAS_PRICE" ]; then
        FORGE_CMD="$FORGE_CMD --gas-price $GAS_PRICE"
    fi
    
    # Add verify flag (skip for testnet to speed up)
    if [ "$CHAIN_ID" != "97" ] && [ "$CHAIN_ID" != "31337" ] && [ "$CHAIN_ID" != "1337" ]; then
        FORGE_CMD="$FORGE_CMD --verify"
    fi
    
    FORGE_CMD="$FORGE_CMD -vvv"
    
    # Run deployment and capture exit code
    eval "$FORGE_CMD" 2>&1 | tee /tmp/wingfi-deploy.log
    DEPLOY_EXIT_CODE=${PIPESTATUS[0]}
    
    # Check if deployment was successful
    if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
        # Also check log for common error patterns
        if grep -qi "Error\|Failed\|Reverted" /tmp/wingfi-deploy.log && ! grep -qi "Transactions saved to:" /tmp/wingfi-deploy.log; then
            RETRY_COUNT=$((RETRY_COUNT + 1))
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                echo -e "${YELLOW}Deployment failed (error in log), will retry...${NC}"
                sleep 2
            fi
        else
            DEPLOY_SUCCESS=true
            RPC_URL="$CURRENT_RPC"  # Update RPC_URL to the one that worked
            echo -e "${GREEN}Deployment successful!${NC}"
        fi
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}Deployment failed (exit code: $DEPLOY_EXIT_CODE), will retry...${NC}"
            sleep 2
        fi
    fi
done

if [ "$DEPLOY_SUCCESS" = false ]; then
    echo -e "\n${YELLOW}Deployment failed after $MAX_RETRIES attempts.${NC}"
    echo "Common issues:"
    echo "1. Gas price/priority fee too low - try setting:"
    echo "   export GAS_PRICE=5000000000      # 5 gwei"
    echo "   export PRIORITY_FEE=100000000    # 0.1 gwei (minimum 50000000)"
    echo "2. RPC endpoints might be temporarily unavailable"
    echo "3. Network congestion"
    echo "4. Insufficient gas balance"
    echo ""
    echo "Try manually with higher gas settings:"
    echo "  export GAS_PRICE=5000000000"
    echo "  export PRIORITY_FEE=100000000"
    echo "  export RPC_URL=https://still-restless-dream.bsc-testnet.quiknode.pro/adcf48bef78d89e10a5d854bddbe45afc079d90a/"
    echo "  bash script/deploy.sh"
    exit 1
fi

# Also check for broadcast log files (Foundry saves deployment info here)
BROADCAST_LOG="broadcast/Deploy.s.sol/${CHAIN_ID}/run-latest.json"
if [ -f "$BROADCAST_LOG" ]; then
    echo "Found broadcast log, extracting addresses from there..."
    # Use jq if available to parse broadcast log
    if command -v jq &> /dev/null; then
        echo "Using jq to parse broadcast log..."
        # Broadcast log contains transaction receipts with contract addresses
        cat "$BROADCAST_LOG" >> /tmp/wingfi-deploy.log
    fi
fi

# Extract contract addresses from the log
echo -e "\n${GREEN}Step 3: Extracting contract addresses...${NC}"

# Use Node.js script to extract addresses (more reliable)
EXTRACTED_ADDRESSES=$(CHAIN_ID=$CHAIN_ID node script/extract-addresses.js /tmp/wingfi-deploy.log 2>/dev/null)

if [ -z "$EXTRACTED_ADDRESSES" ]; then
    echo -e "${YELLOW}Warning: Could not automatically extract addresses.${NC}"
    echo "Please manually extract addresses from the deployment output above."
    echo "Then run:"
    echo "  CHAIN_ID=$CHAIN_ID node script/generate-deployment-json.js --addresses stablecoin=0x... policyNFT=0x... etc"
    exit 1
fi

# Parse extracted addresses using jq if available, otherwise use basic parsing
if command -v jq &> /dev/null && [ ! -z "$EXTRACTED_ADDRESSES" ]; then
    STABLECOIN=$(echo "$EXTRACTED_ADDRESSES" | jq -r '.stablecoin // empty' 2>/dev/null)
    POLICY_NFT=$(echo "$EXTRACTED_ADDRESSES" | jq -r '.policyNFT // empty' 2>/dev/null)
    GLOBAL_POOL=$(echo "$EXTRACTED_ADDRESSES" | jq -r '.globalPool // empty' 2>/dev/null)
    ORACLE_ADAPTER=$(echo "$EXTRACTED_ADDRESSES" | jq -r '.oracleAdapter // empty' 2>/dev/null)
    POOL_MANAGER=$(echo "$EXTRACTED_ADDRESSES" | jq -r '.poolManager // empty' 2>/dev/null)
    
    # Extract airline pools (now in format [{code, address}, ...])
    AIRLINE_POOLS_JSON=$(echo "$EXTRACTED_ADDRESSES" | jq -c '.airlinePools // []' 2>/dev/null)
    
    # Display airline pools
    echo "$EXTRACTED_ADDRESSES" | jq -r '.airlinePools // [] | .[] | "  \(.code): \(.address)"' 2>/dev/null
else
    # Fallback: basic grep extraction
    STABLECOIN=$(echo "$EXTRACTED_ADDRESSES" | grep -o '"stablecoin":"[^"]*"' | cut -d'"' -f4)
    POLICY_NFT=$(echo "$EXTRACTED_ADDRESSES" | grep -o '"policyNFT":"[^"]*"' | cut -d'"' -f4)
    GLOBAL_POOL=$(echo "$EXTRACTED_ADDRESSES" | grep -o '"globalPool":"[^"]*"' | cut -d'"' -f4)
    ORACLE_ADAPTER=$(echo "$EXTRACTED_ADDRESSES" | grep -o '"oracleAdapter":"[^"]*"' | cut -d'"' -f4)
    POOL_MANAGER=$(echo "$EXTRACTED_ADDRESSES" | grep -o '"poolManager":"[^"]*"' | cut -d'"' -f4)
    AIRLINE_POOLS=()
fi

# Display extracted addresses
echo -e "\n${GREEN}Extracted Contract Addresses:${NC}"
echo "  Stablecoin: $STABLECOIN"
echo "  PolicyNFT: $POLICY_NFT"
echo "  GlobalPool: $GLOBAL_POOL"
echo "  OracleAdapter: $ORACLE_ADAPTER"
echo "  PoolManager: $POOL_MANAGER"

# Generate deployment JSON
echo -e "\n${GREEN}Step 4: Generating deployment JSON...${NC}"

# Use airline pools JSON from extraction (already in correct format)
if [ -z "$AIRLINE_POOLS_JSON" ]; then
    AIRLINE_POOLS_JSON="[]"
fi

# Get deployer address
DEPLOYER_ADDRESS=""
if command -v cast &> /dev/null; then
    DEPLOYER_KEY="$PRIVATE_KEY"
    if [[ "$DEPLOYER_KEY" =~ ^0x ]]; then
        DEPLOYER_KEY="${DEPLOYER_KEY#0x}"
    fi
    DEPLOYER_ADDRESS=$(cast wallet address --private-key "0x$DEPLOYER_KEY" 2>/dev/null || echo "")
fi

DEPLOYMENT_INFO=$(cat <<EOF
{
  "deployer": "$DEPLOYER_ADDRESS",
  "stablecoin": "$STABLECOIN",
  "policyNFT": "$POLICY_NFT",
  "globalPool": "$GLOBAL_POOL",
  "oracleAdapter": "$ORACLE_ADAPTER",
  "poolManager": "$POOL_MANAGER",
  "airlinePools": $AIRLINE_POOLS_JSON
}
EOF
)

# Run the JavaScript script to generate final JSON
export CHAIN_ID=$CHAIN_ID
export DEPLOYMENT_INFO="$DEPLOYMENT_INFO"

node script/generate-deployment-json.js

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"
echo -e "Deployment JSON saved to: ${BLUE}deployments/${CHAIN_ID}.json${NC}\n"

