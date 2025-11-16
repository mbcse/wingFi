import { createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

// BSC Testnet RPC
const bscTestnetRpc = 'https://data-seed-prebsc-1-s1.binance.org:8545';

export const wagmiConfig = createConfig({
  chains: [bscTestnet],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  transports: {
    [bscTestnet.id]: http(bscTestnetRpc),
  },
});

// Contract addresses (will be loaded from deployment JSON)
export const CHAIN_ID = 97; // BSC Testnet

