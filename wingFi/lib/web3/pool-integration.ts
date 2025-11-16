'use client';

import { Address, parseUnits, formatUnits } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contracts } from './contracts';

/**
 * Hook to get pool TVL (Total Value Locked)
 */
export function usePoolTVL(poolAddress: Address) {
  return useReadContract({
    address: poolAddress,
    abi: contracts.globalPool.abi,
    functionName: 'getPoolTVL',
  });
}

/**
 * Hook to get user's LP balance in a pool
 */
export function useLPBalance(poolAddress: Address, userAddress?: Address) {
  return useReadContract({
    address: poolAddress,
    abi: contracts.globalPool.abi,
    functionName: 'getLPBalance',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

/**
 * Hook to get user's token balance (USDC)
 */
export function useTokenBalance(userAddress?: Address) {
  return useReadContract({
    address: contracts.stablecoin.address,
    abi: contracts.stablecoin.abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

/**
 * Hook to get token allowance for a pool
 */
export function useTokenAllowance(
  userAddress?: Address,
  spenderAddress?: Address
) {
  return useReadContract({
    address: contracts.stablecoin.address,
    abi: contracts.stablecoin.abi,
    functionName: 'allowance',
    args: userAddress && spenderAddress ? [userAddress, spenderAddress] : undefined,
    query: {
      enabled: !!userAddress && !!spenderAddress,
    },
  });
}

/**
 * Hook to approve token spending
 */
export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (spender: Address, amount: bigint) => {
    writeContract({
      address: contracts.stablecoin.address,
      abi: contracts.stablecoin.abi,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to deposit into a pool
 */
export function useDeposit(poolAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = (amount: string) => {
    const amountWei = parseUnits(amount, 18); // Assuming 18 decimals
    writeContract({
      address: poolAddress,
      abi: contracts.globalPool.abi,
      functionName: 'deposit',
      args: [amountWei],
    });
  };

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to withdraw from a pool
 */
export function useWithdraw(poolAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = (amount: string) => {
    const amountWei = parseUnits(amount, 18); // Assuming 18 decimals
    writeContract({
      address: poolAddress,
      abi: contracts.globalPool.abi,
      functionName: 'withdraw',
      args: [amountWei],
    });
  };

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to deposit with automatic approval
 */
export function useDepositWithApproval(poolAddress: Address, userAddress?: Address) {
  const { approve, isPending: isApproving, isSuccess: isApproved, hash: approvalHash } = useApproveToken();
  const { deposit, isPending: isDepositing, isSuccess: isDeposited } = useDeposit(poolAddress);
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(userAddress, poolAddress);

  const depositWithApproval = async (amount: string) => {
    if (!userAddress) return;

    const amountWei = parseUnits(amount, 18);
    
    // Check if approval is needed
    const currentAllowance = allowance as bigint | undefined;
    if (!currentAllowance || currentAllowance < amountWei) {
      // Approve first - deposit will be triggered after approval in the component
      approve(poolAddress, amountWei);
      return { needsApproval: true };
    }

    // Deposit if already approved
    deposit(amount);
    return { needsApproval: false };
  };

  return {
    depositWithApproval,
    isApproving,
    isApproved,
    approvalHash,
    isDepositing,
    isDeposited,
    refetchAllowance,
    needsApproval: allowance && typeof allowance === 'bigint' ? allowance < parseUnits('0.01', 18) : true,
  };
}

/**
 * Format token amount from wei to readable string
 */
export function formatTokenAmount(amount: bigint | undefined, decimals: number = 18): string {
  if (!amount) return '0';
  return formatUnits(amount, decimals);
}

/**
 * Parse token amount from string to wei
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  return parseUnits(amount, decimals);
}

