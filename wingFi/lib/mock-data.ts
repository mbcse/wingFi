export interface GlobalPoolData {
  tvl: number;
  lpCount: number;
  apy: number;
  premiumsCollected: number;
  claimsPaid: number;
  utilization: number;
  riskScore: number;
}

export interface AirlinePoolData {
  id: string;
  airline: string;
  logo: string;
  onTime: number;
  delayRate: number;
  cancellationRate: number;
  tvl: number;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  premiumIncome: number;
  claimsPaid: number;
  utilization: number;
}

export interface CrowdFillData {
  id: string;
  flight: string;
  route: string;
  departure: string;
  coverageRequired: number;
  coverageFilled: number;
  premium: number;
  timeLeft: string;
  riskLevel: 'low' | 'medium' | 'high';
  contributors: Array<{ address: string; amount: number }>;
}

export interface LPPosition {
  poolType: 'global' | 'airline' | 'crowd-fill';
  poolName: string;
  amountDeposited: number;
  currentValue: number;
  premiumsEarned: number;
  pendingRewards: number;
  apy: number;
}

export const globalPoolData: GlobalPoolData = {
  tvl: 5280000,
  lpCount: 342,
  apy: 14.2,
  premiumsCollected: 892000,
  claimsPaid: 445000,
  utilization: 68,
  riskScore: 7.2,
};

export const airlinePools: AirlinePoolData[] = [
  {
    id: 'emirates',
    airline: 'Emirates',
    logo: '/emirates-airline-logo.jpg',
    onTime: 89,
    delayRate: 8,
    cancellationRate: 1,
    tvl: 820000,
    apy: 12.4,
    riskLevel: 'low',
    premiumIncome: 142000,
    claimsPaid: 23000,
    utilization: 62,
  },
  {
    id: 'lufthansa',
    airline: 'Lufthansa',
    logo: '/lufthansa-airline-logo.jpg',
    onTime: 85,
    delayRate: 11,
    cancellationRate: 2,
    tvl: 650000,
    apy: 15.8,
    riskLevel: 'medium',
    premiumIncome: 128000,
    claimsPaid: 45000,
    utilization: 71,
  },
  {
    id: 'air-india',
    airline: 'Air India',
    logo: '/air-india-airline-logo.jpg',
    onTime: 72,
    delayRate: 22,
    cancellationRate: 4,
    tvl: 420000,
    apy: 22.5,
    riskLevel: 'high',
    premiumIncome: 98000,
    claimsPaid: 78000,
    utilization: 85,
  },
  {
    id: 'indigo',
    airline: 'Indigo',
    logo: '/indigo-airline-logo.jpg',
    onTime: 80,
    delayRate: 15,
    cancellationRate: 3,
    tvl: 580000,
    apy: 17.2,
    riskLevel: 'medium',
    premiumIncome: 115000,
    claimsPaid: 52000,
    utilization: 75,
  },
  {
    id: 'qatar',
    airline: 'Qatar Airways',
    logo: '/qatar-airways-airline-logo.jpg',
    onTime: 91,
    delayRate: 7,
    cancellationRate: 1,
    tvl: 920000,
    apy: 11.8,
    riskLevel: 'low',
    premiumIncome: 156000,
    claimsPaid: 28000,
    utilization: 58,
  },
];

export const crowdFillPolicies: CrowdFillData[] = [
  {
    id: 'cf-1',
    flight: 'EK203',
    route: 'DXB → LHR',
    departure: '2024-03-15 14:30',
    coverageRequired: 5000,
    coverageFilled: 3500,
    premium: 250,
    timeLeft: '4h 23m',
    riskLevel: 'low',
    contributors: [
      { address: '0x742d...8f4a', amount: 1500 },
      { address: '0x8a3c...2e9b', amount: 2000 },
    ],
  },
  {
    id: 'cf-2',
    flight: 'AI101',
    route: 'DEL → JFK',
    departure: '2024-03-15 22:15',
    coverageRequired: 8000,
    coverageFilled: 5200,
    premium: 640,
    timeLeft: '12h 8m',
    riskLevel: 'high',
    contributors: [
      { address: '0x5e7f...3c1d', amount: 2500 },
      { address: '0x9d4a...7b8e', amount: 1700 },
      { address: '0x3b2c...5f9a', amount: 1000 },
    ],
  },
  {
    id: 'cf-3',
    flight: 'LH456',
    route: 'FRA → SFO',
    departure: '2024-03-16 08:45',
    coverageRequired: 6000,
    coverageFilled: 4800,
    premium: 360,
    timeLeft: '22h 15m',
    riskLevel: 'medium',
    contributors: [
      { address: '0x1f6e...9a2b', amount: 3000 },
      { address: '0x7c5d...4e3f', amount: 1800 },
    ],
  },
];

export const lpPositions: LPPosition[] = [
  {
    poolType: 'global',
    poolName: 'Global Pool',
    amountDeposited: 50000,
    currentValue: 52800,
    premiumsEarned: 2800,
    pendingRewards: 420,
    apy: 14.2,
  },
  {
    poolType: 'airline',
    poolName: 'Emirates Pool',
    amountDeposited: 25000,
    currentValue: 26200,
    premiumsEarned: 1200,
    pendingRewards: 180,
    apy: 12.4,
  },
  {
    poolType: 'crowd-fill',
    poolName: 'EK203 Coverage',
    amountDeposited: 1500,
    currentValue: 1530,
    premiumsEarned: 30,
    pendingRewards: 15,
    apy: 18.5,
  },
];

export const overviewStats = {
  totalTVL: 5280000,
  totalPremiums: 892000,
  totalClaims: 445000,
  globalAPY: 14.2,
  airlineAvgAPY: 15.9,
  crowdFillAvgAPY: 18.5,
  delayPercentage: 12.4,
  cancellationPercentage: 2.1,
  topAirlineRating: 'Qatar Airways - 91%',
};

export const recentEvents = [
  { type: 'claim', text: 'Claim triggered: AI101 delayed 3hrs', amount: 2400, time: '2 hours ago' },
  { type: 'deposit', text: 'New LP deposit to Emirates Pool', amount: 15000, time: '4 hours ago' },
  { type: 'claim', text: 'Claim paid: LH789 cancellation', amount: 5800, time: '6 hours ago' },
  { type: 'deposit', text: 'New LP deposit to Global Pool', amount: 50000, time: '8 hours ago' },
];
