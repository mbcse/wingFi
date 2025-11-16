'use client';

import { WalletConnectButton } from './wallet-connect-button';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';

export function Topbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-end gap-4 px-6">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <WalletConnectButton />
      </div>
    </header>
  );
}
