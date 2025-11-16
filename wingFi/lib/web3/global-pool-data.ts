'use client';

import { useReadContract } from 'wagmi';
import { contracts } from './contracts';
import { formatTokenAmount } from './pool-integration';
import { Address } from 'viem';

/**
 * Hook to get Global Pool data
 */
export function useGlobalPoolData() {
  const { data: tvl, isLoading: tvlLoading } = useReadContract({
    address: contracts.globalPool.address,
    abi: contracts.globalPool.abi,
    functionName: 'getPoolTVL',
  });

  const { data: premiumsData } = useReadContract({
    address: contracts.globalPool.address,
    abi: contracts.globalPool.abi,
    functionName: 'totalPremiums',
  });

  const { data: claimsData } = useReadContract({
    address: contracts.globalPool.address,
    abi: contracts.globalPool.abi,
    functionName: 'totalPayouts',
  });

  const { data: apyData } = useReadContract({
    address: contracts.globalPool.address,
    abi: contracts.globalPool.abi,
    functionName: 'getAPY',
  });

  const { data: lpCountData } = useReadContract({
    address: contracts.globalPool.address,
    abi: contracts.globalPool.abi,
    functionName: 'getActiveLPCount',
  });

  const { data: utilizationData } = useReadContract({
    address: contracts.globalPool.address,
    abi: contracts.globalPool.abi,
    functionName: 'getUtilization',
  });

  const tvlFormatted = tvl && typeof tvl === 'bigint' ? formatTokenAmount(tvl) : '0';
  const tvlNumber = parseFloat(tvlFormatted);
  
  // Format premiums and claims from wei (18 decimals) to readable numbers
  const premiumsFormatted = premiumsData && typeof premiumsData === 'bigint' ? formatTokenAmount(premiumsData) : '0';
  const premiumsCollected = parseFloat(premiumsFormatted);
  
  const claimsFormatted = claimsData && typeof claimsData === 'bigint' ? formatTokenAmount(claimsData) : '0';
  const claimsPaid = parseFloat(claimsFormatted);
  
  // APY from contract (in basis points, divide by 100 for percentage)
  const apy = apyData && typeof apyData === 'bigint' ? Number(apyData) / 100 : 0;
  
  // LP count from contract (actual count of active LPs)
  const lpCount = lpCountData && typeof lpCountData === 'bigint' ? Number(lpCountData) : 0;

  // Utilization from contract (in basis points, divide by 100 for percentage)
  const utilization = utilizationData && typeof utilizationData === 'bigint' 
    ? Number(utilizationData) / 100 
    : 0;

  return {
    tvl: tvlNumber,
    tvlFormatted,
    tvlLoading,
    lpCount,
    apy,
    premiumsCollected,
    claimsPaid,
    utilization,
    riskScore: 0, // Would need more complex calculation
  };
}

/**
 * Hook to get user's position in Global Pool
 */
export function useGlobalPoolPosition(userAddress?: Address) {
  const { data: lpBalance, isLoading: balanceLoading } = useReadContract({
    address: contracts.globalPool.address,
    abi: contracts.globalPool.abi,
    functionName: 'getLPBalance',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const balanceFormatted = lpBalance && typeof lpBalance === 'bigint' ? formatTokenAmount(lpBalance) : '0';
  const balanceNumber = parseFloat(balanceFormatted);

  return {
    lpBalance: balanceNumber,
    lpBalanceFormatted: balanceFormatted,
    balanceLoading,
  };
}

