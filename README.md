# 🛫 WingFi Protocol

> **The First DeFi Prediction Market for Flight Delays**  
> Democratizing travel insurance through blockchain technology

[![BSC Testnet](https://img.shields.io/badge/BSC-Testnet-yellow)](https://testnet.bscscan.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-green)](https://soliditylang.org/)


---

## 🚨 The Problem

### Traditional Flight Insurance is Broken

Flight delays cost passengers **$40+ billion annually**, yet traditional insurance solutions are:

- **💸 Expensive**: 15-30% of ticket price for basic coverage
- **⏰ Slow**: Claims take weeks or months to process
- **🔒 Opaque**: No transparency in pricing or reserves
- **🎯 Restrictive**: Complex terms, high rejection rates
- **🏦 Centralized**: Insurance giants act as gatekeepers

### The DeFi Opportunity

**23% of all flights are delayed** - creating a massive, predictable risk market that traditional finance has failed to efficiently capture. Travel enthusiasts and frequent flyers need:

- ✅ Instant, automated payouts
- ✅ Transparent, fair pricing
- ✅ Direct access to underwriting (LP opportunities)
- ✅ Prediction market dynamics for flight reliability

---

## 💡 The WingFi Solution

### A New DeFi Primitive: Travel Risk Markets

WingFi introduces **airline pool liquidity**, where:

1. **Travelers** buy parametric insurance with transparent pricing
2. **DeFi Investors** provide liquidity to airline-specific pools and earn APY
3. **Oracle Networks** verify flight status objectively
4. **Smart Contracts** execute instant payouts (50% for delays, 100% for cancellations)

### Why This is Revolutionary

**It's Not Just Insurance - It's a Prediction Market**

- **Trade airline reliability** through liquidity provision
- **Stake on specific carriers** (Emirates vs. Air India)
- **Earn yield from flight delays** (LP returns 8-25% APY)
- **Speculate on travel trends** (seasonal route risks)

Think of it as:
- **Uniswap** for flight delay risk
- **Polymarket** for airline performance
- **Aave** for travel insurance underwriting

---

## 🎯 For Travel Enthusiasts

### Your Personal Flight Hedge Fund

**Frequent Flyer?** Turn your travel knowledge into profit:

1. **Deposit USDC** into airline pools (e.g., $1000 into Turkish Airlines pool)
2. **Earn premiums** from travelers buying insurance on TK flights
3. **Benefit from carrier expertise** - Know Emirates is reliable? LP their pool for steady returns
4. **Diversify globally** - Global Pool spreads risk across 10 airlines

**Example ROI:**
- Emirates Pool: 12% APY (stable carrier, lower payouts)
- IndiGo Pool: 22% APY (higher delay rate, higher premiums)
- Global Pool: 15% APY (diversified, balanced risk)

### Prediction Market Dynamics

**Airline pools act as prediction markets:**
- High APY = Market believes carrier is risky
- High liquidity = Market confidence in carrier
- Utilization rate = Real-time risk exposure
- Premium flow = Traveler sentiment

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Applications                        │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │  Next.js DApp    │          │ Chrome Extension │        │
│  │  • Dashboard     │          │  • PNR Extract   │        │
│  │  • Pool Manager  │          │  • Quick Buy     │        │
│  │  • LP Interface  │          │  • MetaMask Link │        │
│  └──────────────────┘          └──────────────────┘        │
└────────────────────────┬────────────────────────────────────┘
                         │ Wagmi + Viem
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Smart Contract Layer                       │
│                      (BSC Mainnet)                           │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │             Pool Manager Contract                │       │
│  │  • Route purchases to pools                      │       │
│  │  • Manage airline registry                       │       │
│  │  • Mint Policy NFTs                              │       │
│  └──────────────────┬───────────────────────────────┘       │
│                     │                                        │
│     ┌───────────────┼───────────────┐                       │
│     │               │               │                       │
│     ▼               ▼               ▼                       │
│  ┌────────┐  ┌────────────┐  ┌───────────┐                │
│  │ Global │  │  Airline   │  │  Policy   │                │
│  │  Pool  │  │   Pools    │  │    NFT    │                │
│  │        │  │            │  │           │                │
│  │ • TVL  │  │ Emirates   │  │ ERC-721   │                │
│  │ • APY  │  │ Air India  │  │ Metadata  │                │
│  │ • LPs  │  │ Qatar      │  │ Transfer  │                │
│  │ • Risk │  │ Delta      │  │ Portfolio │                │
│  │        │  │ Lufthansa  │  │           │                │
│  │        │  │ Swiss      │  │           │                │
│  │        │  │ Turkish    │  │           │                │
│  │        │  │ IndiGo     │  │           │                │
│  │        │  │ American   │  │           │                │
│  │        │  │ British    │  │           │                │
│  └────────┘  └────────────┘  └───────────┘                │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Oracle Adapter       │
         │                        │
         │  • FlightAPI.io        │
         │  • Status verification │
         │  • Auto payouts        │
         │  • 50% delayed         │
         │  • 100% cancelled      │
         └────────────────────────┘
```

---

## 🏊 Airline Pools: The Core Innovation

### What Are Airline Pools?

Specialized liquidity pools for individual carriers - **the DeFi equivalent of betting on airline performance**.

### How They Work

**1. Liquidity Provision**
```
LP deposits $10,000 USDC into Emirates Pool
↓
Receives proportional share of pool
↓
Earns from all Emirates flight premiums
↓
Pays out for Emirates delays/cancellations
```

**2. Risk-Return Profile**

| Pool | Avg Delay Rate | APY Range | Risk Level | Best For |
|------|---------------|-----------|------------|----------|
| Emirates (EK) | 8% | 10-15% | Low | Conservative LPs |
| Qatar (QR) | 10% | 12-18% | Low-Med | Stable returns |
| Turkish (TK) | 15% | 15-22% | Medium | Balanced |
| Air India (AI) | 18% | 18-25% | Medium | Growth |
| IndiGo (6E) | 22% | 20-30% | High | Aggressive |

**3. Dynamic Pricing**

Premiums adjust based on:
- **Pool utilization**: Higher utilization = Higher premiums
- **Historical claims**: More payouts = Higher future premiums
- **Seasonal patterns**: Winter delays = Higher pricing
- **Real-time data**: FlightAPI.io live stats

**4. Capital Efficiency**

```solidity
Pool Utilization = (Capital at Risk / Total Liquidity) * 100

Example: Emirates Pool
- Total Liquidity: $500,000
- Active Policies: $150,000 coverage
- Utilization: 30%
- Status: ✅ Healthy (accepting new policies)

If utilization > 80%: ⚠️ Premiums increase, new policies limited
```

### The LP Strategy Guide

**Conservative Strategy: Global Pool**
- Diversified across all 10 airlines
- Lowest volatility
- Steady 12-15% APY
- Best for: First-time DeFi users

**Balanced Strategy: Major Carriers**
- Focus on Emirates, Qatar, Lufthansa
- Moderate risk/reward
- 15-20% APY target
- Best for: Experienced DeFi investors

**Aggressive Strategy: Emerging Market Airlines**
- Concentrate on IndiGo, Air India, Turkish
- Higher delay rates = Higher premiums
- 20-30% APY potential
- Best for: Risk-tolerant yield farmers

**Pro Strategy: Multi-Pool Arbitrage**
- Monitor real-time utilization across pools
- Shift capital to highest APY opportunities
- Rebalance weekly based on seasonal patterns
- 25%+ APY achievable

---

## 🔧 Technical Specifications

### Smart Contracts

**Core Contracts** (5 deployed):

1. **Pool Manager** - Central coordinator
2. **Global Pool** - Diversified liquidity
3. **Policy NFT** - ERC-721 insurance policies
4. **Oracle Adapter** - Flight status verification
5. **Mock USDC** - Stablecoin (testnet)

**Airline Pools** (10 deployed):
- Emirates, Air India, Qatar, Delta, Lufthansa
- Swiss, Turkish, IndiGo, American, British Airways

### Technology Stack

**Blockchain**
- Network: Binance Smart Chain (BSC)
- Language: Solidity ^0.8.20
- Framework: Foundry
- Testing: Forge + Anvil

**Frontend**
- Framework: Next.js 15 (App Router)
- Web3: Wagmi v2 + Viem v2
- UI: TailwindCSS + shadcn/ui
- Charts: Recharts
- State: React Query

**Infrastructure**
- Oracle: FlightAPI.io (live flight data)
- Cache: File-based (24-hour TTL)
- Analytics: Real-time contract reads
- Browser: Chrome Extension (Manifest V3)

### Key Features

✅ **Parametric Insurance** - No claims process, objective verification  
✅ **Instant Payouts** - Smart contract execution within minutes  
✅ **LP Tracking** - On-chain active liquidity provider counting  
✅ **Utilization Metrics** - Real-time risk exposure (basis points)  
✅ **APY Calculation** - Dynamic: `(Premiums - Payouts) / TVL * 100`  
✅ **NFT Policies** - ERC-721 tokens as proof of coverage  
✅ **Chrome Extension** - Seamless PNR extraction from booking sites  
✅ **Live Flight Data** - 5-minute updates from FlightAPI.io  

---

## 📜 Contract Addresses

### BSC Testnet (Chain ID: 97)

**Core Contracts:**

| Contract | Address | BSCScan |
|----------|---------|---------|
| Mock USDC | `0x0615ed72dac620046b867e16cd59f028c94b7aa9` | [View](https://testnet.bscscan.com/address/0x0615ed72dac620046b867e16cd59f028c94b7aa9) |
| Policy NFT | `0xf8c1bf3a252beeee3fd1946e6ca9d5def777e82b` | [View](https://testnet.bscscan.com/address/0xf8c1bf3a252beeee3fd1946e6ca9d5def777e82b) |
| Global Pool | `0x6c2ff189a836b65192483e2ebb170558e489e1bb` | [View](https://testnet.bscscan.com/address/0x6c2ff189a836b65192483e2ebb170558e489e1bb) |
| Oracle Adapter | `0x679c538aacff218b798fb4de33f61f93e704fb73` | [View](https://testnet.bscscan.com/address/0x679c538aacff218b798fb4de33f61f93e704fb73) |
| Pool Manager | `0xb3fc44c600379b2d9afee86dffa9d46120063cf8` | [View](https://testnet.bscscan.com/address/0xb3fc44c600379b2d9afee86dffa9d46120063cf8) |

**Airline Pools:**

| Airline | Code | Address | BSCScan |
|---------|------|---------|---------|
| Emirates | EK | `0x64d2f13d7b1e5d0772bd4ffbf880cd96920c4c5a` | [View](https://testnet.bscscan.com/address/0x64d2f13d7b1e5d0772bd4ffbf880cd96920c4c5a) |
| Air India | AI | `0x4be4e62dc4f5061504454c109a3d2aae71620920` | [View](https://testnet.bscscan.com/address/0x4be4e62dc4f5061504454c109a3d2aae71620920) |
| Qatar Airways | QR | `0x7e4b1ad7e3905b3fa8b3e72aa98d16be644ea3f2` | [View](https://testnet.bscscan.com/address/0x7e4b1ad7e3905b3fa8b3e72aa98d16be644ea3f2) |
| Delta | DL | `0x673898837e0d7f9117603c3c8618b78295d3057a` | [View](https://testnet.bscscan.com/address/0x673898837e0d7f9117603c3c8618b78295d3057a) |
| Lufthansa | LH | `0x4cbeca11c8405ea9e5c3dce7b46832efc976d698` | [View](https://testnet.bscscan.com/address/0x4cbeca11c8405ea9e5c3dce7b46832efc976d698) |
| Swiss | LX | `0xe95327a94e82fb58950255d8a2e42b6d87bea255` | [View](https://testnet.bscscan.com/address/0xe95327a94e82fb58950255d8a2e42b6d87bea255) |
| Turkish | TK | `0xbcaee4391267949580df76d6dbea8f4ae5298102` | [View](https://testnet.bscscan.com/address/0xbcaee4391267949580df76d6dbea8f4ae5298102) |
| IndiGo | 6E | `0x450b244ffc23608cab470c344fcb4c9cc483005c` | [View](https://testnet.bscscan.com/address/0x450b244ffc23608cab470c344fcb4c9cc483005c) |
| American | AA | `0xaed36919502c17621dde9c9df7acc7b138e1e249` | [View](https://testnet.bscscan.com/address/0xaed36919502c17621dde9c9df7acc7b138e1e249) |
| British Airways | BA | `0x4ef821cc20e88261d913da54dcd259a5dffbf4a6` | [View](https://testnet.bscscan.com/address/0x4ef821cc20e88261d913da54dcd259a5dffbf4a6) |

✅ **All contracts verified on BSCScan**

---

## 🚀 Quick Start

### For Travelers (Buy Insurance)

1. **Visit DApp**: http://localhost:3000
2. **Connect Wallet**: MetaMask on BSC Testnet
3. **Choose Flight**: Enter PNR or flight details
4. **Select Pool**: Global (diversified) or specific airline
5. **Pay Premium**: Approve USDC, buy policy
6. **Receive NFT**: Policy minted as NFT to your wallet

**Or use Chrome Extension:**
1. Install extension: Load `wingFi-extension/` in Chrome
2. Visit any booking site (e.g., airline website)
3. Extension auto-detects PNR
4. Click "Buy Insurance" → Redirects to DApp
5. One-click purchase

### For LPs (Earn Yield)

1. **Navigate to Pool**: Dashboard → Select airline pool
2. **Deposit USDC**: Choose amount (min $100)
3. **Approve Transaction**: MetaMask confirmation
4. **Start Earning**: APY compounds with each premium collected
5. **Track Performance**: Real-time dashboard with:
   - Your LP balance
   - Pool utilization
   - Earned premiums
   - Claim ratio
6. **Withdraw Anytime**: Subject to pool utilization < 80%

### For Developers

```bash
# Clone repository
git clone https://github.com/wingfi/protocol
cd WINGFI

# Install dependencies
cd wingFi
npm install

# Copy deployment data
npm run copy-deployment

# Start development server
npm run dev

# Deploy Chrome extension
# 1. Chrome → Extensions → Developer mode
# 2. Load unpacked → Select wingFi-extension/
```

---

## 📊 How It Works: Complete Flow

### User Journey: Buying Insurance

```
1. Traveler books flight on Expedia
   ↓
2. Chrome extension detects PNR: ABC123
   ↓
3. Clicks "Buy Insurance" → Opens DApp
   ↓
4. Selects coverage: $500 (Premium: $25)
   ↓
5. Chooses pool: Emirates Pool (Lower risk)
   ↓
6. Smart contract flow:
   - Approve $25 USDC to Emirates Pool
   - Call PoolManager.buyInsuranceAirline()
   - Mint Policy NFT with metadata
   - Transfer premium to Emirates Pool
   ↓
7. Receives NFT #42 in wallet
   ↓
8. Flight delay detected by Oracle
   ↓
9. Oracle calls payout function
   - Calculates: $500 * 50% = $250 (delayed)
   - Transfers $250 from Emirates Pool to user
   - Marks NFT as "Claimed"
   ↓
10. User receives $250 instantly (5 min from delay)
```

### LP Journey: Providing Liquidity

```
1. DeFi investor analyzes airline pools
   ↓
2. Identifies: Turkish Airlines
   - APY: 22%
   - Utilization: 35%
   - Trend: Growing Istanbul hub traffic
   ↓
3. Deposits $10,000 USDC to TK Pool
   ↓
4. Smart contract updates:
   - totalLiquidity += $10,000
   - lpAddresses[user] = true
   - balances[user] = $10,000
   ↓
5. Over 1 month:
   - 150 policies sold on TK flights
   - $3,750 premiums collected
   - 8 delays, 1 cancellation
   - $1,200 paid out in claims
   - Net: $2,550 profit to pool
   ↓
6. LP's share: ($10K / $50K pool) * $2,550 = $510
   ↓
7. Monthly return: $510 / $10,000 = 5.1%
   ↓
8. Annualized APY: 5.1% * 12 = 61.2% (exceptional month)
   ↓
9. LP decides:
   - Compound: Keep earning
   - Withdraw: Claim $10,510
   - Rebalance: Move to higher APY pool
```

### Oracle Journey: Automated Payouts

```
1. OracleAdapter monitors all active policies
   ↓
2. Every 5 minutes: Fetch flight data from FlightAPI.io
   ↓
3. For Policy #42 (EK524, departure: 10:00 AM)
   ↓
4. FlightAPI returns: "Delayed, new departure: 10:45 AM"
   ↓
5. Oracle validates:
   - Policy is active ✓
   - Not expired ✓
   - Not already paid ✓
   - Delay > 15 minutes ✓
   ↓
6. Calculates payout:
   - Coverage: $500
   - Status: Delayed
   - Payout: $500 * 50% = $250
   ↓
7. Calls OracleAdapter.submitFlightStatus(EK524, DELAYED)
   ↓
8. Contract executes:
   - IPool(emiratesPool).payout(user, $250)
   - PolicyNFT.markPayoutExecuted(42)
   - Emit PayoutExecuted event
   ↓
9. User receives $250 in USDC (instant)
   ↓
10. Analytics updated:
    - Emirates Pool: totalPayouts += $250
    - Global stats: claimsRatio recalculated
    - LP returns adjusted
```

---

## 🎨 Live Demo Features

### Dashboard
- Real-time protocol TVL across all pools
- Total premiums collected vs claims paid
- Active LP count
- Top performing airline pools
- Live flight delay ticker
- Premiums vs Claims chart
- TVL growth trend

### Global Pool
- Current TVL and APY
- Total LPs and utilization
- Premiums collected and claims paid
- Deposit/Withdraw interface
- Historical performance charts
- Risk score metrics

### Airline Pools
- Individual pool analytics per carrier
- Real-time flight stats (delays, cancellations)
- Pool-specific APY and utilization
- LP leaderboard
- Carrier performance history
- Deposit interface with risk warnings

### My Policies
- Portfolio view of all owned policy NFTs
- Policy status (Active, Claimed, Expired)
- Flight details and coverage amounts
- Claim history
- Premium paid vs payout received

### Oracle Test (Admin)
- Manual flight status submission
- Test payout execution
- Debug interface for development

---

## 📈 Market Opportunity

### DeFi + Prediction Markets + Travel

**Total Addressable Market:**
- Global flight insurance: **$4.2B** (2024)
- DeFi lending TVL: **$50B**
- Prediction market volume: **$10B** (2024, growing)
- Annual air travelers: **4.5 billion**

**WingFi Unique Position:**
- First DeFi protocol for flight insurance
- Only platform with airline-specific pools
- Combines insurance + prediction market dynamics
- Targets both travelers AND DeFi yield farmers

### Why Travel Enthusiasts Love It

**Traditional insurance sucks for frequent flyers:**
- Pay per trip (expensive at 100+ flights/year)
- Can't capture upside from flight performance knowledge
- No loyalty rewards or compounding

**WingFi empowers frequent travelers:**
- Become an LP in pools for routes you fly
- Earn yield from your travel expertise
- Hedge your own flight risks
- Build a travel risk portfolio

---


## 🛣️ Roadmap

### ✅ Phase 1: Foundation (Completed)
- Smart contract development
- Frontend DApp
- Chrome extension
- BSC Testnet deployment
- 10 airline pools live

### 🚀 Phase 2: Mainnet (Q1 2025)
- Security audits
- BSC Mainnet deployment
- Initial liquidity bootstrap ($500K)
- Marketing campaign
- BNB Chain MVB program

### 🌍 Phase 3: Scale (Q2 2025)
- 20+ airline pools
- Mobile app (iOS, Android)
- OTA integrations (Expedia, Booking.com)
- $5M TVL target

### 🏛️ Phase 4: Governance (Q3-Q4 2025)
- WING token launch
- DAO governance
- Community-driven pool creation
- Advanced analytics dashboard

---





## 🌟 Why WingFi Will Dominate

### It's Not Just Insurance - It's a DeFi Money Lego

**Composability:**
- Policy NFTs can be wrapped as collateral
- LP tokens tradeable on secondary markets
- Integrate with yield aggregators
- Cross-chain bridge for multi-network liquidity

**Network Effects:**
- More LPs → Lower premiums → More travelers
- More travelers → Higher APY → More LPs
- More data → Better pricing → Higher profits
- Higher profits → More pools → More opportunities

**First Mover Advantage:**
- No direct DeFi competitors in travel insurance
- Established 10 airline pools (hard to replicate)
- Real user data and claim history
- Brand recognition in crypto travel community

---



<div align="center">

**Built with ❤️ by travelers, for travelers**

*Making flight insurance accessible, transparent, and profitable for everyone*

 [Read Whitepaper](WHITEPAPER.md) • [View Contracts](CONTRACT_ADDRESSES.md)

</div>

