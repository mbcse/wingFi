'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useWallet } from '@/lib/wallet-context';
import { useDepositWithApproval, useWithdraw, useTokenBalance, useLPBalance, formatTokenAmount } from '@/lib/web3/pool-integration';
import { Address } from 'viem';
import { contracts } from '@/lib/web3/contracts';

interface DepositWithdrawFormProps {
  poolName: string;
  poolAddress: Address;
  poolType?: 'global' | 'airline';
}

export function DepositWithdrawForm({
  poolName,
  poolAddress,
  poolType = 'global',
}: DepositWithdrawFormProps) {
  const { isConnected, address } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Get user's token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useTokenBalance(
    address as Address | undefined
  );

  // Get user's LP balance in the pool
  const { data: lpBalance, refetch: refetchLPBalance } = useLPBalance(
    poolAddress,
    address as Address | undefined
  );

  // Deposit with automatic approval
  const {
    depositWithApproval,
    isApproving,
    isApproved,
    approvalHash,
    isDepositing,
    isDeposited,
    refetchAllowance,
    needsApproval,
  } = useDepositWithApproval(poolAddress, address as Address | undefined);

  // Withdraw
  const {
    withdraw,
    isPending: isWithdrawing,
    isSuccess: isWithdrawn,
  } = useWithdraw(poolAddress);

  // Auto-trigger deposit after approval is confirmed
  useEffect(() => {
    if (isApproved && depositAmount && !isDepositing && !isDeposited) {
      // Refetch allowance and trigger deposit
      refetchAllowance().then(() => {
        setTimeout(() => {
          depositWithApproval(depositAmount);
        }, 500); // Small delay to ensure allowance is updated
      });
    }
  }, [isApproved, depositAmount, isDepositing, isDeposited, refetchAllowance, depositWithApproval]);

  // Refetch balances after successful transactions
  useEffect(() => {
    if (isDeposited) {
      refetchTokenBalance();
      refetchLPBalance();
      setDepositAmount('');
    }
  }, [isDeposited, refetchTokenBalance, refetchLPBalance]);

  useEffect(() => {
    if (isWithdrawn) {
      refetchTokenBalance();
      refetchLPBalance();
      setWithdrawAmount('');
    }
  }, [isWithdrawn, refetchTokenBalance, refetchLPBalance]);

  const availableBalance = tokenBalance && typeof tokenBalance === 'bigint' ? parseFloat(formatTokenAmount(tokenBalance)) : 0;
  const stakedBalance = lpBalance && typeof lpBalance === 'bigint' ? parseFloat(formatTokenAmount(lpBalance)) : 0;

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    await depositWithApproval(depositAmount);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    withdraw(withdrawAmount);
  };

  if (!isConnected) {
    return (
      <Card className="glass-card p-6">
        <p className="text-center text-muted-foreground">
          Please connect your wallet to deposit or withdraw
        </p>
      </Card>
    );
  }

  const isDepositLoading = isApproving || isDepositing;
  const depositButtonText = isApproving
    ? 'Approving...'
    : isDepositing
    ? 'Depositing...'
    : isApproved && !isDeposited
    ? 'Processing Deposit...'
    : needsApproval
    ? 'Approve & Deposit'
    : 'Deposit';

  return (
    <Card className="glass-card p-6">
      <Tabs defaultValue="deposit">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <div>
            <Label htmlFor="deposit-amount">Amount (USDC)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="mt-2"
              disabled={isDepositLoading}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Available: ${availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount((availableBalance * 0.25).toFixed(2))}
              disabled={isDepositLoading}
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount((availableBalance * 0.5).toFixed(2))}
              disabled={isDepositLoading}
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount((availableBalance * 0.75).toFixed(2))}
              disabled={isDepositLoading}
            >
              75%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount(availableBalance.toFixed(2))}
              disabled={isDepositLoading}
            >
              MAX
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleDeposit}
            disabled={
              !depositAmount ||
              parseFloat(depositAmount) <= 0 ||
              parseFloat(depositAmount) > availableBalance ||
              isDepositLoading
            }
          >
            {depositButtonText} to {poolName}
          </Button>

          {isApproved && !isDeposited && !isDepositing && (
            <div className="rounded-lg bg-blue-500/20 p-3 text-sm text-blue-400">
              Approval successful! Initiating deposit...
            </div>
          )}

          {isDeposited && (
            <div className="rounded-lg bg-green-500/20 p-3 text-sm text-green-400">
              Deposit successful!
            </div>
          )}

          <div className="rounded-lg bg-secondary/30 p-4">
            <h4 className="mb-2 text-sm font-semibold">Deposit Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-medium">{depositAmount || '0'} LP tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange rate</span>
                <span className="font-medium">1:1</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <div>
            <Label htmlFor="withdraw-amount">Amount (LP Tokens)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="mt-2"
              disabled={isWithdrawing}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Staked: ${stakedBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawAmount((stakedBalance * 0.25).toFixed(2))}
              disabled={isWithdrawing}
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawAmount((stakedBalance * 0.5).toFixed(2))}
              disabled={isWithdrawing}
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawAmount((stakedBalance * 0.75).toFixed(2))}
              disabled={isWithdrawing}
            >
              75%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawAmount(stakedBalance.toFixed(2))}
              disabled={isWithdrawing}
            >
              MAX
            </Button>
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={handleWithdraw}
            disabled={
              !withdrawAmount ||
              parseFloat(withdrawAmount) <= 0 ||
              parseFloat(withdrawAmount) > stakedBalance ||
              isWithdrawing
            }
          >
            {isWithdrawing ? 'Withdrawing...' : `Withdraw from ${poolName}`}
          </Button>

          {isWithdrawn && (
            <div className="rounded-lg bg-green-500/20 p-3 text-sm text-green-400">
              Withdrawal successful!
            </div>
          )}

          <div className="rounded-lg bg-secondary/30 p-4">
            <h4 className="mb-2 text-sm font-semibold">Withdraw Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-medium">${withdrawAmount || '0'} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unlock period</span>
                <span className="font-medium">Instant</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
