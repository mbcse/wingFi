'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAccount, useDisconnect, useConnect, useSwitchChain, useChainId } from 'wagmi';
import { raylsTestnet } from './web3/config';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | undefined;
  isWrongNetwork: boolean;
  switchToRayls: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== raylsTestnet.id;

  const handleConnect = async () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const switchToRayls = () => {
    if (switchChain) {
      switchChain({ chainId: raylsTestnet.id });
    }
  };

  // Auto-switch to Rayls Testnet when connected to wrong network
  useEffect(() => {
    if (isWrongNetwork && switchChain) {
      // Try to switch automatically
      switchChain({ chainId: raylsTestnet.id });
    }
  }, [isWrongNetwork, switchChain]);

  return (
    <WalletContext.Provider
      value={{
        address: address || null,
        isConnected,
        connect: handleConnect,
        disconnect: handleDisconnect,
        chainId,
        isWrongNetwork,
        switchToRayls,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
