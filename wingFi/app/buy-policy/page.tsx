'use client';

import { use, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useApproveAndBuyInsurance } from '@/lib/web3/buy-insurance';
import { contracts } from '@/lib/web3/contracts';

interface BuyPolicyPageProps {
  searchParams: Promise<{
    pnr?: string;
    flight?: string;
    coverage?: string;
    premium?: string;
    poolType?: string;
  }>;
}

export default function BuyPolicyPage({ searchParams }: BuyPolicyPageProps) {
  const params = use(searchParams);
  const { address, isConnected } = useAccount();
  
  // Policy details from URL params
  const [policyData, setPolicyData] = useState({
    pnr: params.pnr || '',
    flightId: params.flight || '',
    coverage: params.coverage || '500',
    premium: params.premium || '25',
    poolType: params.poolType || 'global'
  });

  // Transaction state
  const [currentStep, setCurrentStep] = useState<'connect' | 'approve' | 'buy' | 'success'>('connect');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Use approve and buy insurance hook
  const { approveAndBuy, isApproving, isBuying, error: hookError } = useApproveAndBuyInsurance();

  useEffect(() => {
    if (isConnected) {
      setCurrentStep('approve');
    }
  }, [isConnected]);

  const handleBuyPolicy = async () => {
    try {
      setError('');
      setCurrentStep('approve');
      
      // Extract airline code if using airline pool
      const airlineCode = policyData.poolType === 'airline' 
        ? policyData.flightId.match(/^[A-Z]{2}/)?.[0] 
        : undefined;
      
      // Call approve and buy
      const hash = await approveAndBuy(
        policyData.poolType as 'global' | 'airline' | 'crowdfill',
        policyData.flightId,
        policyData.pnr,
        policyData.coverage,
        policyData.premium,
        airlineCode
      );
      
      if (hash) {
        setTxHash(hash);
        setCurrentStep('success');
      }
    } catch (err: any) {
      console.error('Policy purchase failed:', err);
      setError(err.message || 'Transaction failed');
    }
  };
  
  // Update error from hook
  useEffect(() => {
    if (hookError) {
      setError(hookError);
    }
  }, [hookError]);

  // Pool info for display
  const poolInfoMap = {
    global: {
      name: 'Global Pool',
      icon: '🌍',
      description: 'Shared liquidity across all flights',
      processing: 'Instant',
      coverage: 'All airlines'
    },
    airline: {
      name: `${policyData.flightId.match(/^[A-Z]{2}/)?.[0] || 'Airline'} Pool`,
      icon: '✈️',
      description: 'Airline-specific coverage pool',
      processing: 'Instant',
      coverage: 'Single airline'
    },
    crowdfill: {
      name: 'Crowd-Fill Pool',
      icon: '👥',
      description: 'Community-backed coverage',
      processing: '2-24 hours',
      coverage: 'Custom funding'
    }
  };
  
  const poolInfo = poolInfoMap[policyData.poolType as keyof typeof poolInfoMap] || poolInfoMap.global;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              🛡️ AeroFi Insurance
            </h1>
            <p className="text-slate-400 mt-1">Flight Protection Protocol</p>
          </div>
          {isConnected && (
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400">Connected</p>
              <p className="text-white font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Policy Details Card */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Policy Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">PNR</p>
                <p className="text-lg font-semibold text-white">{policyData.pnr}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Flight</p>
                <p className="text-lg font-semibold text-white">{policyData.flightId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Coverage</p>
                <p className="text-lg font-semibold text-white">${policyData.coverage}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Premium</p>
                <p className="text-lg font-semibold text-green-400">${policyData.premium}</p>
              </div>
            </div>
          </div>

          {/* Pool Selection Card */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Coverage Pool</h2>
            <div className="bg-slate-900/50 border border-indigo-500/30 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{poolInfo.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{poolInfo.name}</h3>
                  <p className="text-slate-400 text-sm mb-3">{poolInfo.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Processing: </span>
                      <span className="text-white font-medium">{poolInfo.processing}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Coverage: </span>
                      <span className="text-white font-medium">{poolInfo.coverage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Steps */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Purchase Steps</h2>
            <div className="space-y-4">
              {/* Step 1: Connect */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border ${
                currentStep === 'connect' 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : isConnected 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-slate-700 bg-slate-900/30'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  isConnected ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {isConnected ? '✓' : '1'}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">Connect Wallet</h3>
                  <p className="text-sm text-slate-400">
                    {isConnected ? 'Wallet connected!' : 'Connect your wallet to continue'}
                  </p>
                </div>
              </div>

              {/* Step 2: Approve & Buy */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border ${
                currentStep === 'approve' || currentStep === 'buy'
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : currentStep === 'success'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-700 bg-slate-900/30'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  currentStep === 'success' ? 'bg-green-500 text-white' : 
                  currentStep === 'approve' || currentStep === 'buy' ? 'bg-indigo-500 text-white animate-pulse' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {currentStep === 'success' ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">Approve & Purchase</h3>
                  <p className="text-sm text-slate-400">
                    {currentStep === 'success' ? 'Policy purchased successfully!' :
                     isApproving ? '⏳ Approving USDC... (waiting for confirmation)' :
                     isBuying ? '⏳ Buying insurance... (waiting for confirmation)' :
                     currentStep === 'approve' || currentStep === 'buy' ? 'Confirm in MetaMask' :
                     'Waiting for wallet connection'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">❌</div>
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Transaction Failed</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {currentStep === 'success' && (
            <div className="bg-green-500/10 border border-green-500 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Policy Purchased!</h2>
              <p className="text-slate-300 mb-4">Your flight insurance is now active</p>
              {txHash && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-slate-400 mb-1">Transaction Hash</p>
                  <p className="text-white font-mono text-xs break-all">{txHash}</p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <a
                  href="/my-policies"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
                >
                  View My Policies
                </a>
                <button
                  onClick={() => window.close()}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          {currentStep !== 'success' && (
            <div className="flex gap-4">
              {!isConnected ? (
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition">
                  Connect Wallet
                </button>
              ) : (
                <button
                  onClick={handleBuyPolicy}
                  disabled={isApproving || isBuying}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? '⏳ Approving...' : 
                   isBuying ? '⏳ Purchasing...' : 
                   `Pay $${policyData.premium} & Buy Policy`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            Powered by AeroFi Protocol • Rayls Testnet
          </p>
        </div>
      </div>
    </div>
  );
}

