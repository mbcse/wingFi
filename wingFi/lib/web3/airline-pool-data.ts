'use client';

import { useReadContract } from 'wagmi';
import { contracts } from './contracts';
import { formatTokenAmount } from './pool-integration';
import { Address } from 'viem';

/**
 * Hook to get all airline pools from deployment
 */
export function useAirlinePools() {
  const airlinePools = Object.entries(contracts.airlinePools).map(([code, pool]) => ({
    code,
    name: pool.name,
    address: pool.address,
  }));

  return airlinePools;
}

/**
 * Hook to get airline pool TVL
 */
export function useAirlinePoolTVL(poolAddress: Address) {
  return useReadContract({
    address: poolAddress,
    abi: contracts.globalPool.abi, // Same ABI as GlobalPool
    functionName: 'getPoolTVL',
  });
}

/**
 * Hook to get comprehensive airline pool data
 */
export function useAirlinePoolData(poolAddress: Address, airlineName: string, airlineCode: string) {
  const { data: tvl, isLoading: tvlLoading } = useAirlinePoolTVL(poolAddress);

  const { data: premiumsData } = useReadContract({
    address: poolAddress,
    abi: contracts.globalPool.abi, // Same ABI as GlobalPool
    functionName: 'totalPremiums',
  });

  const { data: claimsData } = useReadContract({
    address: poolAddress,
    abi: contracts.globalPool.abi, // Same ABI as GlobalPool
    functionName: 'totalPayouts',
  });

  const { data: lpCountData } = useReadContract({
    address: poolAddress,
    abi: contracts.globalPool.abi, // Same ABI as GlobalPool
    functionName: 'getActiveLPCount',
  });

  const { data: utilizationData } = useReadContract({
    address: poolAddress,
    abi: contracts.globalPool.abi, // Same ABI as GlobalPool
    functionName: 'getUtilization',
  });

  const tvlFormatted = tvl && typeof tvl === 'bigint' ? formatTokenAmount(tvl) : '0';
  const tvlNumber = parseFloat(tvlFormatted);
  
  // Format premiums and claims from wei (18 decimals) to readable numbers
  const premiumsFormatted = premiumsData && typeof premiumsData === 'bigint' ? formatTokenAmount(premiumsData) : '0';
  const premiumsCollected = parseFloat(premiumsFormatted);
  
  const claimsFormatted = claimsData && typeof claimsData === 'bigint' ? formatTokenAmount(claimsData) : '0';
  const claimsPaid = parseFloat(claimsFormatted);

  // LP count from contract
  const lpCount = lpCountData && typeof lpCountData === 'bigint' ? Number(lpCountData) : 0;

  // Utilization from contract (in basis points, divide by 100 for percentage)
  const utilization = utilizationData && typeof utilizationData === 'bigint' 
    ? Number(utilizationData) / 100 
    : 0;

  // Mock data for metrics that aren't on-chain yet
  // In production, these would come from off-chain data sources or oracle
  const mockMetrics = {
    onTime: Math.floor(Math.random() * 20) + 75, // 75-95%
    delayRate: Math.floor(Math.random() * 15) + 5, // 5-20%
    cancellationRate: Math.floor(Math.random() * 4) + 1, // 1-5%
  };

  // Calculate risk level based on metrics
  const getRiskLevel = () => {
    if (mockMetrics.onTime >= 85) return 'low';
    if (mockMetrics.onTime >= 75) return 'medium';
    return 'high';
  };

  // Calculate APY estimate (would come from actual premium/claim data in production)
  const calculateAPY = () => {
    const baseAPY = 15;
    const riskMultiplier = getRiskLevel() === 'high' ? 1.5 : getRiskLevel() === 'medium' ? 1.2 : 1;
    return baseAPY * riskMultiplier;
  };

  return {
    id: airlineCode.toLowerCase(),
    code: airlineCode,
    airlineCode, // Added for dashboard
    airlineName, // Added for dashboard
    airline: airlineName,
    logo: `/airlines/${airlineCode.toLowerCase()}.png`,
    onTime: mockMetrics.onTime,
    delayRate: mockMetrics.delayRate,
    cancellationRate: mockMetrics.cancellationRate,
    tvl: tvlNumber,
    tvlFormatted,
    apy: calculateAPY(),
    riskLevel: getRiskLevel() as 'low' | 'medium' | 'high',
    premiumIncome: premiumsCollected, // Now from contract
    premiumsCollected, // Added for dashboard
    claimsPaid, // Now from contract
    lpCount, // Now from contract
    utilization, // Now from contract
    address: poolAddress,
    isLoading: tvlLoading,
  };
}

/**
 * Hook to get all airline pools with their data
 * Calls hooks at top level for each pool (fixed number)
 */
export function useAllAirlinePoolsData() {
  const pools = useAirlinePools();
  
  // Call hooks at top level for all 10 pools
  const pool0 = pools[0] ? useAirlinePoolData(pools[0].address, pools[0].name, pools[0].code) : null;
  const pool1 = pools[1] ? useAirlinePoolData(pools[1].address, pools[1].name, pools[1].code) : null;
  const pool2 = pools[2] ? useAirlinePoolData(pools[2].address, pools[2].name, pools[2].code) : null;
  const pool3 = pools[3] ? useAirlinePoolData(pools[3].address, pools[3].name, pools[3].code) : null;
  const pool4 = pools[4] ? useAirlinePoolData(pools[4].address, pools[4].name, pools[4].code) : null;
  const pool5 = pools[5] ? useAirlinePoolData(pools[5].address, pools[5].name, pools[5].code) : null;
  const pool6 = pools[6] ? useAirlinePoolData(pools[6].address, pools[6].name, pools[6].code) : null;
  const pool7 = pools[7] ? useAirlinePoolData(pools[7].address, pools[7].name, pools[7].code) : null;
  const pool8 = pools[8] ? useAirlinePoolData(pools[8].address, pools[8].name, pools[8].code) : null;
  const pool9 = pools[9] ? useAirlinePoolData(pools[9].address, pools[9].name, pools[9].code) : null;

  const poolsData = [pool0, pool1, pool2, pool3, pool4, pool5, pool6, pool7, pool8, pool9].filter(p => p !== null);
  
  return {
    pools: poolsData,
    isLoading: poolsData.some(p => p && p.isLoading),
  };
}

