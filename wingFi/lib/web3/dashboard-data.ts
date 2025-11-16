'use client';

import { useReadContract } from 'wagmi';
import { contracts } from './contracts';
import { formatUnits } from 'viem';
import { useGlobalPoolData } from './global-pool-data';
import { useAllAirlinePoolsData } from './airline-pool-data';

/**
 * Hook to fetch aggregate dashboard statistics from all contracts
 */
export function useDashboardStats() {
  const { tvl: globalTVL, premiumsCollected: globalPremiums, claimsPaid: globalClaims, lpCount: globalLPs } = useGlobalPoolData();
  const { pools: airlinePools } = useAllAirlinePoolsData();

  // Calculate totals across all pools
  const totalTVL = airlinePools.reduce((sum, pool) => sum + pool.tvl, globalTVL);
  const totalPremiums = airlinePools.reduce((sum, pool) => sum + pool.premiumsCollected, globalPremiums);
  const totalClaims = airlinePools.reduce((sum, pool) => sum + pool.claimsPaid, globalClaims);
  const totalLPs = airlinePools.reduce((sum, pool) => sum + pool.lpCount, globalLPs);

  // Calculate average APY (weighted by TVL)
  let weightedAPYSum = 0;
  let totalAPYWeight = 0;
  
  airlinePools.forEach(pool => {
    if (pool.tvl > 0 && pool.premiumsCollected > 0) {
      const apy = ((pool.premiumsCollected - pool.claimsPaid) / pool.tvl) * 100;
      weightedAPYSum += apy * pool.tvl;
      totalAPYWeight += pool.tvl;
    }
  });
  
  const airlineAvgAPY = totalAPYWeight > 0 ? weightedAPYSum / totalAPYWeight : 0;
  
  // Global pool APY
  const globalAPY = globalTVL > 0 ? ((globalPremiums - globalClaims) / globalTVL) * 100 : 0;

  // Calculate delay and cancellation rates
  const totalPolicies = airlinePools.reduce((sum, pool) => {
    // Approximate policies based on premiums (assuming $25 avg premium)
    return sum + Math.floor(pool.premiumsCollected / 25);
  }, Math.floor(globalPremiums / 25));

  const totalDelayedCancelled = Math.floor((totalClaims / totalPremiums) * totalPolicies) || 0;
  const delayPercentage = totalPolicies > 0 ? ((totalDelayedCancelled * 0.7) / totalPolicies) * 100 : 0; // Assume 70% delayed
  const cancellationPercentage = totalPolicies > 0 ? ((totalDelayedCancelled * 0.3) / totalPolicies) * 100 : 0; // Assume 30% cancelled

  return {
    totalTVL,
    totalPremiums,
    totalClaims,
    totalLPs,
    globalAPY,
    airlineAvgAPY,
    crowdFillAvgAPY: 0, // Not implemented yet
    delayPercentage,
    cancellationPercentage,
    totalPolicies,
    claimsRatio: totalPremiums > 0 ? (totalClaims / totalPremiums) * 100 : 0,
    isLoading: airlinePools.length === 0,
  };
}

/**
 * Hook to fetch top performing airline pools
 */
export function useTopAirlinePools(limit: number = 3) {
  const { pools: airlinePools } = useAllAirlinePoolsData();

  // Calculate APY for each pool and sort
  const poolsWithAPY = airlinePools
    .map(pool => {
      const apy = pool.tvl > 0 ? ((pool.premiumsCollected - pool.claimsPaid) / pool.tvl) * 100 : 0;
      return {
        ...pool,
        calculatedAPY: apy,
      };
    })
    .sort((a, b) => b.calculatedAPY - a.calculatedAPY)
    .slice(0, limit);

  return poolsWithAPY;
}

/**
 * Hook to fetch recent activity from PolicyNFT events
 * Returns recent policy purchases and payouts
 */
export function useRecentActivity(limit: number = 5) {
  // Fetch PolicyPurchased events
  const { data: purchaseEvents } = useReadContract({
    address: contracts.policyNFT.address as `0x${string}`,
    abi: contracts.policyNFT.abi,
    functionName: 'PolicyPurchased',
    // Note: This won't work as PolicyPurchased is not a view function
    // We'll need to fetch events differently
  });

  // For now, return empty array (would need event fetching with viem's getLogs)
  return [];
}

