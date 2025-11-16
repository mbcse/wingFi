import { Address } from 'viem';
import deploymentData from '../deployment.json';

export interface DeploymentData {
  chainId: number;
  deployer: string;
  contracts: {
    Stablecoin: { address: Address; abi: any[] };
    PolicyNFT: { address: Address; abi: any[] };
    GlobalPool: { address: Address; abi: any[] };
    OracleAdapter: { address: Address; abi: any[] };
    PoolManager: { address: Address; abi: any[] };
    AirlinePools: {
      [code: string]: {
        name: string;
        code: string;
        address: Address;
        abi: any[];
      };
    };
  };
}

export const deployment = deploymentData as DeploymentData;

export const contracts = {
  stablecoin: {
    address: deployment.contracts.Stablecoin.address as Address,
    abi: deployment.contracts.Stablecoin.abi,
  },
  usdc: {
    address: deployment.contracts.Stablecoin.address as Address,
    abi: deployment.contracts.Stablecoin.abi,
  },
  policyNFT: {
    address: deployment.contracts.PolicyNFT.address as Address,
    abi: deployment.contracts.PolicyNFT.abi,
  },
  globalPool: {
    address: deployment.contracts.GlobalPool.address as Address,
    abi: deployment.contracts.GlobalPool.abi,
  },
  oracleAdapter: {
    address: deployment.contracts.OracleAdapter.address as Address,
    abi: deployment.contracts.OracleAdapter.abi,
  },
  poolManager: {
    address: deployment.contracts.PoolManager.address as Address,
    abi: deployment.contracts.PoolManager.abi,
  },
  airlinePools: Object.values(deployment.contracts.AirlinePools).map(pool => ({
    name: pool.name,
    code: pool.code,
    address: pool.address as Address,
    abi: pool.abi,
  })),
};

