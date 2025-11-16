import { useAccount, useReadContract, useContractReads } from 'wagmi';
import { contracts } from './contracts';

interface Policy {
  tokenId: bigint;
  flightId: string;
  pnr: string;
  poolType: number;
  coverageAmount: bigint;
  premiumPaid: bigint;
  expiryTimestamp: bigint;
  poolAddress: string;
  payoutExecuted: boolean;
}

// Hook to get user's policy NFTs
export function useUserPolicies() {
  const { address } = useAccount();

  // Get user's NFT balance
  const { data: balance } = useReadContract({
    address: contracts.policyNFT.address,
    abi: contracts.policyNFT.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get token IDs owned by user
  const { data: tokenIds } = useReadContract({
    address: contracts.policyNFT.address,
    abi: [
      {
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'tokensOfOwner',
        outputs: [{ name: '', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'tokensOfOwner',
    args: address ? [address] : undefined,
  });

  return {
    balance: balance ? Number(balance) : 0,
    tokenIds: tokenIds as bigint[] | undefined,
  };
}

// Hook to get policy details
export function usePolicyDetails(tokenId: bigint | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.policyNFT.address,
    abi: contracts.policyNFT.abi,
    functionName: 'getPolicy',
    args: tokenId !== undefined ? [tokenId] : undefined,
  });

  if (!data) return null;

  const policyData = data as any;
  
  return {
    tokenId,
    flightId: policyData.flightId,
    pnr: policyData.pnr,
    poolType: Number(policyData.poolType),
    coverageAmount: policyData.coverageAmount,
    premiumPaid: policyData.premiumPaid,
    expiryTimestamp: policyData.expiryTimestamp,
    poolAddress: policyData.poolAddress,
    payoutExecuted: policyData.payoutExecuted,
  } as Policy;
}

// Hook to get all policies for user
export function useAllUserPolicies() {
  const { tokenIds } = useUserPolicies();
  const { address } = useAccount();

  // Get details for all tokens
  const contracts_array = tokenIds?.map((tokenId) => ({
    address: contracts.policyNFT.address,
    abi: contracts.policyNFT.abi,
    functionName: 'getPolicy',
    args: [tokenId],
  }));

  const { data, isLoading } = useContractReads({
    contracts: contracts_array,
  });

  if (!data || !tokenIds) {
    return { policies: [], isLoading };
  }

  const policies: Policy[] = tokenIds.map((tokenId, index) => {
    const result = data[index];
    if (!result || result.status !== 'success') return null;

    const policyData = result.result as any;
    
    return {
      tokenId,
      flightId: policyData.flightId,
      pnr: policyData.pnr,
      poolType: Number(policyData.poolType),
      coverageAmount: policyData.coverageAmount,
      premiumPaid: policyData.premiumPaid,
      expiryTimestamp: policyData.expiryTimestamp,
      poolAddress: policyData.poolAddress,
      payoutExecuted: policyData.payoutExecuted,
    };
  }).filter(p => p !== null) as Policy[];

  return { policies, isLoading };
}

// Helper to get pool type name
export function getPoolTypeName(poolType: number): string {
  switch (poolType) {
    case 0: return 'Global Pool';
    case 1: return 'Airline Pool';
    case 2: return 'Crowd-Fill Pool';
    default: return 'Unknown';
  }
}

// Helper to get policy status
export function getPolicyStatus(policy: Policy): 'active' | 'expired' | 'claimed' {
  if (policy.payoutExecuted) return 'claimed';
  
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (policy.expiryTimestamp < now) return 'expired';
  
  return 'active';
}

// Helper to decode bytes32 to string
export function formatFlightId(flightIdBytes32: string): string {
  if (!flightIdBytes32 || flightIdBytes32 === '0x' || flightIdBytes32 === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return 'N/A';
  }
  
  try {
    // Remove 0x prefix and trailing zeros
    const hex = flightIdBytes32.replace('0x', '').replace(/0+$/, '');
    
    // Convert hex to string
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      if (charCode > 0 && charCode < 127) { // Only printable ASCII
        str += String.fromCharCode(charCode);
      }
    }
    
    return str || 'N/A';
  } catch (e) {
    console.error('Error formatting flight ID:', e);
    return 'N/A';
  }
}

