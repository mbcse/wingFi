#!/bin/bash

# Script to decode and verify Oracle payout transaction

if [ -z "$1" ]; then
    echo "Usage: ./check-oracle-tx.sh <transaction_hash>"
    echo "Example: ./check-oracle-tx.sh 0x1234..."
    exit 1
fi

TX_HASH=$1
RPC_URL="https://data-seed-prebsc-1-s1.binance.org:8545"

echo "🔍 Analyzing Oracle Transaction"
echo "================================"
echo ""
echo "Transaction: $TX_HASH"
echo ""

# Get transaction receipt
echo "📋 Getting transaction details..."
cast receipt $TX_HASH --rpc-url $RPC_URL -j > /tmp/receipt.json

# Check status
STATUS=$(cat /tmp/receipt.json | jq -r '.status')
if [ "$STATUS" = "0x1" ]; then
    echo "✅ Transaction Status: SUCCESS"
else
    echo "❌ Transaction Status: FAILED"
    exit 1
fi

echo ""
echo "📊 Events Emitted:"
echo "─────────────────"

# Parse logs
LOGS=$(cat /tmp/receipt.json | jq -r '.logs')
NUM_LOGS=$(echo "$LOGS" | jq 'length')

echo "Total events: $NUM_LOGS"
echo ""

for i in $(seq 0 $((NUM_LOGS - 1))); do
    TOPIC0=$(echo "$LOGS" | jq -r ".[$i].topics[0]")
    ADDRESS=$(echo "$LOGS" | jq -r ".[$i].address")
    
    # Decode event signatures
    case $TOPIC0 in
        0x7b0d1d01d4e5e93b3c6f8e1e8e1e8e1e8e1e8e1e8e1e8e1e8e1e8e1e8e1e8e1*)
            echo "Event $((i+1)): FlightStatusSubmitted"
            echo "  From: $ADDRESS"
            ;;
        0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef*)
            echo "Event $((i+1)): Transfer (USDC Payout!)"
            FROM=$(echo "$LOGS" | jq -r ".[$i].topics[1]" | sed 's/^0x//' | sed 's/^0*/0x/')
            TO=$(echo "$LOGS" | jq -r ".[$i].topics[2]" | sed 's/^0x//' | sed 's/^0*/0x/')
            VALUE=$(echo "$LOGS" | jq -r ".[$i].data")
            echo "  💰 From: $FROM"
            echo "  💰 To: $TO"
            echo "  💰 Amount: $((16#${VALUE:2})) wei"
            ;;
        *)
            echo "Event $((i+1)): PayoutExecuted (likely)"
            echo "  Address: $ADDRESS"
            ;;
    esac
    echo ""
done

echo "✅ Analysis Complete!"
echo ""
echo "To view full details, visit:"
echo "https://testnet.bscscan.com/tx/$TX_HASH#eventlog"

