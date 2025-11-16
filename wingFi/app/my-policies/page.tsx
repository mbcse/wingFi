'use client';

import { useAccount } from 'wagmi';
import { useAllUserPolicies, getPoolTypeName, getPolicyStatus, formatFlightId } from '@/lib/web3/user-policies';
import { formatUnits } from 'viem';

export default function MyPoliciesPage() {
  const { address, isConnected } = useAccount();
  const { policies, isLoading } = useAllUserPolicies();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-slate-400">Please connect your wallet to view your policies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-700">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            🛡️ My Insurance Policies
          </h1>
          <p className="text-slate-400 mt-2">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="text-slate-400 mt-4">Loading your policies...</p>
          </div>
        )}

        {/* No Policies */}
        {!isLoading && policies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Policies Yet</h2>
            <p className="text-slate-400 mb-6">You haven't purchased any flight insurance policies</p>
            <a
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
            >
              Browse Pools
            </a>
          </div>
        )}

        {/* Policies Grid */}
        {!isLoading && policies.length > 0 && (
          <div className="grid gap-6">
            {policies.map((policy) => {
              const status = getPolicyStatus(policy);
              const statusColors = {
                active: 'bg-green-500/10 border-green-500 text-green-400',
                expired: 'bg-slate-500/10 border-slate-500 text-slate-400',
                claimed: 'bg-blue-500/10 border-blue-500 text-blue-400',
              };

              const statusIcons = {
                active: '✅',
                expired: '⏰',
                claimed: '💰',
              };

              return (
                <div
                  key={policy.tokenId.toString()}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          Policy #{policy.tokenId.toString()}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm border ${statusColors[status]}`}>
                          {statusIcons[status]} {status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {getPoolTypeName(policy.poolType)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Flight ID</p>
                      <p className="text-white font-semibold">
                        {formatFlightId(policy.flightId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">PNR</p>
                      <p className="text-white font-semibold">{policy.pnr}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Coverage</p>
                      <p className="text-white font-semibold">
                        ${formatUnits(policy.coverageAmount, 18)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Premium Paid</p>
                      <p className="text-white font-semibold">
                        ${formatUnits(policy.premiumPaid, 18)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Expires</p>
                      <p className="text-white text-sm">
                        {new Date(Number(policy.expiryTimestamp) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    {policy.payoutExecuted && (
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Status</p>
                        <p className="text-green-400 font-semibold">
                          ✅ Payout Executed
                        </p>
                      </div>
                    )}
                  </div>

                  {status === 'active' && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-400">
                        ✈️ Your policy is active and will automatically pay out if your flight is delayed or cancelled
                      </p>
                    </div>
                  )}

                  {status === 'claimed' && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-400">
                        💰 Payout has been processed to your wallet
                      </p>
                    </div>
                  )}

                  {status === 'expired' && (
                    <div className="mt-4 p-3 bg-slate-500/10 border border-slate-500/30 rounded-lg">
                      <p className="text-sm text-slate-400">
                        ⏰ This policy has expired. No payout was needed (flight was on time!)
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {!isLoading && policies.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-1">Total Policies</p>
              <p className="text-2xl font-bold text-white">{policies.length}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-1">Active Policies</p>
              <p className="text-2xl font-bold text-green-400">
                {policies.filter(p => getPolicyStatus(p) === 'active').length}
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-1">Total Coverage</p>
              <p className="text-2xl font-bold text-indigo-400">
                ${policies.reduce((sum, p) => sum + Number(formatUnits(p.coverageAmount, 18)), 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            Powered by WingFi Protocol • BSC Testnet
          </p>
        </div>
      </div>
    </div>
  );
}

