'use client';

import { useWallet } from '@/lib/wallet-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, AlertTriangle } from 'lucide-react';

export function WalletConnectButton() {
  const { address, isConnected, connect, disconnect, isWrongNetwork, switchToRayls } = useWallet();

  // Show switch network button if on wrong network
  if (isConnected && isWrongNetwork) {
    return (
      <Button variant="destructive" className="gap-2" onClick={switchToRayls}>
        <AlertTriangle className="h-4 w-4" />
        Switch to Rayls
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={disconnect}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button className="gap-2" onClick={connect}>
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
