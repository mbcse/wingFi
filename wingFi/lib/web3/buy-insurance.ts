import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseUnits, toHex, pad } from 'viem';
import { contracts } from './contracts';

// Hook for buying insurance
export function useBuyInsurance() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyInsurance = async (
    poolType: 'global' | 'airline' | 'crowdfill',
    flightId: string,
    pnr: string,
    coverageAmount: string,
    premium: string,
    airlineCode?: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsPending(true);
      setError(null);

      // Convert to wei (18 decimals for Mock USDC - use 6 for production USDC)
      const coverageWei = parseUnits(coverageAmount, 18);
      const premiumWei = parseUnits(premium, 18);

      // Convert flightId string to bytes32 (pad with zeros to 32 bytes)
      const flightIdBytes32 = pad(toHex(flightId), { size: 32 });

      // Expiry: 7 days from now
      const expiryTimestamp = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

      let txHash;

      // Call appropriate function based on pool type
      if (poolType === 'global') {
        txHash = await writeContractAsync({
          address: contracts.poolManager.address,
          abi: contracts.poolManager.abi,
          functionName: 'buyInsuranceGlobal',
          args: [
            address,
            flightIdBytes32,
            pnr,
            coverageWei,
            premiumWei,
            expiryTimestamp
          ],
        });
      } else if (poolType === 'airline' && airlineCode) {
        txHash = await writeContractAsync({
          address: contracts.poolManager.address,
          abi: contracts.poolManager.abi,
          functionName: 'buyInsuranceAirline',
          args: [
            address,
            airlineCode,
            flightIdBytes32,
            pnr,
            coverageWei,
            premiumWei,
            expiryTimestamp
          ],
        });
      } else if (poolType === 'crowdfill') {
        txHash = await writeContractAsync({
          address: contracts.poolManager.address,
          abi: contracts.poolManager.abi,
          functionName: 'buyInsuranceCrowdFill',
          args: [
            address,
            flightIdBytes32,
            pnr,
            coverageWei,
            premiumWei,
            expiryTimestamp
          ],
        });
      } else {
        throw new Error('Invalid pool type or missing airline code');
      }

      setIsPending(false);
      return txHash;
    } catch (err: any) {
      console.error('Buy insurance error:', err);
      setError(err.message || 'Failed to buy insurance');
      setIsPending(false);
      throw err;
    }
  };

  return {
    buyInsurance,
    isPending,
    error
  };
}

// Hook for approving USDC
export function useApproveUSDC() {
  const { writeContractAsync } = useWriteContract();
  const [isPending, setIsPending] = useState(false);

  const approve = async (amount: string, spender: `0x${string}`) => {
    try {
      setIsPending(true);
      const amountWei = parseUnits(amount, 18); // 18 decimals for Mock USDC

      const txHash = await writeContractAsync({
        address: contracts.usdc.address,
        abi: contracts.usdc.abi,
        functionName: 'approve',
        args: [spender, amountWei],
      });

      setIsPending(false);
      return txHash;
    } catch (err) {
      setIsPending(false);
      throw err;
    }
  };

  return { approve, isPending };
}

// Combined hook: Approve + Buy
export function useApproveAndBuyInsurance() {
  const { approve, isPending: isApproving } = useApproveUSDC();
  const { buyInsurance, isPending: isBuying, error } = useBuyInsurance();
  const publicClient = usePublicClient();

  const approveAndBuy = async (
    poolType: 'global' | 'airline' | 'crowdfill',
    flightId: string,
    pnr: string,
    coverageAmount: string,
    premium: string,
    airlineCode?: string
  ) => {
    // Determine which pool address to approve based on pool type
    let poolAddress: `0x${string}`;
    if (poolType === 'global') {
      poolAddress = contracts.globalPool.address;
    } else if (poolType === 'airline' && airlineCode) {
      const airlinePool = contracts.airlinePools.find(
        (pool) => pool.code.toLowerCase() === airlineCode.toLowerCase()
      );
      if (!airlinePool) {
        throw new Error(`Airline pool not found for code: ${airlineCode}`);
      }
      poolAddress = airlinePool.address;
    } else {
      throw new Error('Invalid pool type or missing airline code');
    }

    // Step 1: Approve USDC for the correct pool
    const approveHash = await approve(premium, poolAddress);
    console.log('📝 Approval transaction sent:', approveHash);

    // Wait for approval transaction to be mined
    if (publicClient) {
      console.log('⏳ Waiting for approval confirmation...');
      const approvalReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveHash,
        confirmations: 1
      });
      
      if (approvalReceipt.status === 'reverted') {
        throw new Error('Approval transaction failed');
      }
      console.log('✅ USDC approved');
    }

    // Step 2: Buy insurance
    const buyHash = await buyInsurance(poolType, flightId, pnr, coverageAmount, premium, airlineCode);
    console.log('📝 Buy transaction sent:', buyHash);

    // Wait for buy transaction to be mined
    if (publicClient) {
      console.log('⏳ Waiting for buy confirmation...');
      const buyReceipt = await publicClient.waitForTransactionReceipt({
        hash: buyHash,
        confirmations: 1
      });
      
      if (buyReceipt.status === 'reverted') {
        throw new Error('Buy insurance transaction failed');
      }
      console.log('✅ Insurance purchased successfully');
    }

    return buyHash;
  };

  return {
    approveAndBuy,
    isApproving,
    isBuying,
    error
  };
}

