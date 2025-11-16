'use client';

import { SidebarNav } from '@/components/sidebar-nav';
import { Topbar } from '@/components/topbar';
import { AirlinePoolCard } from '@/components/airline-pool-card';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllAirlinePoolsData } from '@/lib/web3/airline-pool-data';
import { FlightTicker } from '@/components/flight-ticker';

export default function AirlinePoolsPage() {
  const { pools: airlinePools, isLoading } = useAllAirlinePoolsData();

  const totalTVL = airlinePools.reduce((sum, pool) => sum + pool.tvl, 0);
  const avgAPY = airlinePools.length > 0 
    ? airlinePools.reduce((sum, pool) => sum + pool.apy, 0) / airlinePools.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <Topbar />
      <FlightTicker />

      <main className="ml-64 pt-28">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-balance">Airline Pools</h1>
            <p className="mt-2 text-muted-foreground">
              Invest in specific airline pools based on performance and risk profile
            </p>
          </div>

          {/* Summary Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Total Airline Pools</p>
              <p className="mt-2 text-3xl font-bold">{airlinePools.length}</p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Total TVL</p>
              <p className="mt-2 text-3xl font-bold">
                {isLoading ? 'Loading...' : `$${(totalTVL / 1000000).toFixed(2)}M`}
              </p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Average APY</p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {isLoading ? 'Loading...' : `${avgAPY.toFixed(1)}%`}
              </p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Best Performer</p>
              <p className="mt-2 text-xl font-bold">
                {isLoading ? '...' : airlinePools.reduce((best, pool) =>
                  pool.onTime > best.onTime ? pool : best, airlinePools[0] || { airline: 'N/A' }
                ).airline}
              </p>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search airlines..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="apy-desc">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apy-desc">Highest APY</SelectItem>
                <SelectItem value="apy-asc">Lowest APY</SelectItem>
                <SelectItem value="tvl-desc">Highest TVL</SelectItem>
                <SelectItem value="ontime-desc">Best On-Time %</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Airline Pool Cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p>Loading airline pools from contracts...</p>
              </div>
            ) : airlinePools.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p>No airline pools found.</p>
              </div>
            ) : (
              airlinePools.map((pool) => (
                <AirlinePoolCard key={pool.id} pool={pool} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
