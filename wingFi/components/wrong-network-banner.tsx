'use client';

import { useWallet } from '@/lib/wallet-context';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export function WrongNetworkBanner() {
  const { isConnected, isWrongNetwork, switchToRayls, chainId } = useWallet();
  const [dismissed, setDismissed] = useState(false);

  if (!isConnected || !isWrongNetwork || dismissed) {
    return null;
  }

  const getNetworkName = (id: number | undefined) => {
    if (!id) return 'Unknown';
    switch (id) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli';
      case 11155111: return 'Sepolia';
      case 56: return 'BSC Mainnet';
      case 97: return 'BSC Testnet';
      case 137: return 'Polygon';
      case 80001: return 'Mumbai';
      default: return `Chain ${id}`;
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-red-500/90 backdrop-blur border-b border-red-600">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
            <div className="text-sm text-white">
              <strong className="font-semibold">Wrong Network:</strong> You're connected to{' '}
              <span className="font-mono">{getNetworkName(chainId)}</span>. 
              Please switch to <span className="font-mono font-semibold">Rayls Testnet</span> to use AeroFi.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={switchToRayls}
              className="bg-white text-red-600 hover:bg-red-50 font-semibold"
            >
              Switch to Rayls
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-red-100 p-1"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

