'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, toHex, pad } from 'viem';
import { contracts } from '@/lib/web3/contracts';

export default function OracleTestPage() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [flightId, setFlightId] = useState('');
  const [status, setStatus] = useState<'0' | '1' | '2'>('1');
  const [result, setResult] = useState<string>('');

  const submitFlightStatus = async () => {
    if (!flightId) {
      setResult('❌ Please enter a flight ID');
      return;
    }

    try {
      setResult('⏳ Submitting flight status...');

      // Convert flightId to bytes32
      const flightIdBytes32 = pad(toHex(flightId), { size: 32 });

      writeContract({
        address: contracts.oracleAdapter.address,
        abi: contracts.oracleAdapter.abi,
        functionName: 'submitFlightStatus',
        args: [flightIdBytes32, parseInt(status)],
      });
    } catch (err: any) {
      console.error('Error submitting status:', err);
      setResult(`❌ Error: ${err.message}`);
    }
  };

  // Update result when transaction confirms
  if (isConfirming && result !== '⏳ Waiting for confirmation...') {
    setResult('⏳ Waiting for confirmation...');
  }

  if (isSuccess && !result.includes('✅')) {
    setResult('✅ Flight status submitted! Payouts executed automatically.');
  }

  if (error && !result.includes('❌')) {
    setResult(`❌ Transaction failed: ${error.message}`);
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-slate-400">Please connect your wallet (must be contract owner)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            🔮 Oracle Admin Panel
          </h1>
          <p className="text-slate-400">
            Submit flight status to trigger automatic payouts
          </p>
          <div className="mt-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            ⚠️ Only the contract owner can submit flight status
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Submit Flight Status</h2>

          {/* Flight ID Input */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Flight ID
            </label>
            <input
              type="text"
              placeholder="e.g., AI302, EK501"
              value={flightId}
              onChange={(e) => setFlightId(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            <p className="text-sm text-slate-400 mt-1">
              Enter the flight number (e.g., AI302, EK501, DL123)
            </p>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Flight Status
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* On Time */}
              <button
                onClick={() => setStatus('0')}
                className={`p-4 rounded-lg border-2 transition ${
                  status === '0'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-3xl mb-2">✅</div>
                <div className="font-semibold">On Time</div>
                <div className="text-xs mt-1 opacity-80">No payout</div>
              </button>

              {/* Delayed */}
              <button
                onClick={() => setStatus('1')}
                className={`p-4 rounded-lg border-2 transition ${
                  status === '1'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-3xl mb-2">⏰</div>
                <div className="font-semibold">Delayed</div>
                <div className="text-xs mt-1 opacity-80">50% payout</div>
              </button>

              {/* Cancelled */}
              <button
                onClick={() => setStatus('2')}
                className={`p-4 rounded-lg border-2 transition ${
                  status === '2'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-3xl mb-2">❌</div>
                <div className="font-semibold">Cancelled</div>
                <div className="text-xs mt-1 opacity-80">100% payout</div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitFlightStatus}
            disabled={isPending || isConfirming || !flightId}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isPending || isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isConfirming ? 'Confirming...' : 'Submitting...'}
              </>
            ) : (
              <>
                <span>🔮</span>
                Submit Flight Status
              </>
            )}
          </button>

          {/* Result Message */}
          {result && (
            <div
              className={`mt-4 p-4 rounded-lg border ${
                result.includes('✅')
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : result.includes('❌')
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}
            >
              {result}
            </div>
          )}

          {/* Transaction Hash */}
          {hash && (
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Transaction Hash:</p>
              <a
                href={`https://testnet.bscscan.com/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300 break-all"
              >
                {hash}
              </a>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📚 How It Works</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex gap-3">
              <span className="text-indigo-400">1.</span>
              <div>
                <strong className="text-white">Enter Flight ID:</strong> The flight number (e.g., AI302)
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-indigo-400">2.</span>
              <div>
                <strong className="text-white">Select Status:</strong> Choose On Time, Delayed, or Cancelled
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-indigo-400">3.</span>
              <div>
                <strong className="text-white">Submit:</strong> Oracle automatically processes all policies for this flight
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-indigo-400">4.</span>
              <div>
                <strong className="text-white">Payouts:</strong> Users receive USDC instantly!
                <ul className="mt-2 ml-4 space-y-1 text-slate-400">
                  <li>• Delayed: 50% of coverage amount</li>
                  <li>• Cancelled: 100% of coverage amount</li>
                  <li>• On Time: No payout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <a
            href="/my-policies"
            className="block bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-lg p-4 text-center transition"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-white font-medium">My Policies</div>
            <div className="text-xs text-slate-400 mt-1">View your insurance</div>
          </a>
          <a
            href="/"
            className="block bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-lg p-4 text-center transition"
          >
            <div className="text-2xl mb-2">🏠</div>
            <div className="text-white font-medium">Home</div>
            <div className="text-xs text-slate-400 mt-1">Back to dashboard</div>
          </a>
        </div>
      </div>
    </div>
  );
}

