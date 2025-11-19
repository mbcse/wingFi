import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { metaMask, walletConnect } from 'wagmi/connectors';

// Define Rayls Testnet Chain
export const raylsTestnet = defineChain({
  id: 123123,
  name: 'Rayls Testnet',
  nativeCurrency: {
    name: 'USDgas',
    symbol: 'USDgas',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://devnet-rpc.rayls.com'],
    },
    public: {
      http: ['https://devnet-rpc.rayls.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Rayls Explorer',
      url: 'https://devnet-explorer.rayls.com',
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [raylsTestnet],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  transports: {
    [raylsTestnet.id]: http('https://devnet-rpc.rayls.com'),
  },
});

// Contract addresses (will be loaded from deployment JSON)
export const CHAIN_ID = 123123; // Rayls Testnet

