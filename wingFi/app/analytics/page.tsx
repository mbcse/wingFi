import { SidebarNav } from '@/components/sidebar-nav';
import { Topbar } from '@/components/topbar';
import { FlightTicker } from '@/components/flight-ticker';
import { StatCard } from '@/components/stat-card';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { airlinePools } from '@/lib/mock-data';
import { TrendingUp, TrendingDown, Activity, AlertCircle, DollarSign, Plane } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock analytics data
const premiumsVsClaimsData = [
  { date: 'Jan', premiums: 620000, claims: 380000 },
  { date: 'Feb', premiums: 680000, claims: 420000 },
  { date: 'Mar', premiums: 720000, claims: 450000 },
  { date: 'Apr', premiums: 780000, claims: 390000 },
  { date: 'May', premiums: 840000, claims: 410000 },
  { date: 'Jun', premiums: 892000, claims: 445000 },
];

const utilizationData = [
  { date: 'Jan', global: 62, airline: 68, crowdFill: 85 },
  { date: 'Feb', global: 64, airline: 70, crowdFill: 88 },
  { date: 'Mar', global: 63, airline: 72, crowdFill: 82 },
  { date: 'Apr', global: 66, airline: 74, crowdFill: 90 },
  { date: 'May', global: 67, airline: 73, crowdFill: 87 },
  { date: 'Jun', global: 68, airline: 75, crowdFill: 89 },
];

const delayRatesData = [
  { date: 'Jan', emirates: 7, lufthansa: 10, airIndia: 24, indigo: 14, qatar: 6 },
  { date: 'Feb', emirates: 9, lufthansa: 12, airIndia: 23, indigo: 16, qatar: 7 },
  { date: 'Mar', emirates: 8, lufthansa: 11, airIndia: 21, indigo: 15, qatar: 7 },
  { date: 'Apr', emirates: 7, lufthansa: 10, airIndia: 22, indigo: 14, qatar: 6 },
  { date: 'May', emirates: 8, lufthansa: 11, airIndia: 23, indigo: 15, qatar: 7 },
  { date: 'Jun', emirates: 8, lufthansa: 11, airIndia: 22, indigo: 15, qatar: 7 },
];

const profitabilityData = [
  { date: 'Jan', profit: 240000 },
  { date: 'Feb', profit: 260000 },
  { date: 'Mar', profit: 270000 },
  { date: 'Apr', profit: 390000 },
  { date: 'May', profit: 430000 },
  { date: 'Jun', profit: 447000 },
];

export default function AnalyticsPage() {
  // Calculate metrics
  const totalPremiums = 892000;
  const totalClaims = 445000;
  const netProfit = totalPremiums - totalClaims;
  const profitMargin = (netProfit / totalPremiums) * 100;
  const claimsRatio = (totalClaims / totalPremiums) * 100;

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <Topbar />
      <FlightTicker />

      <main className="ml-64 pt-28">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-balance">Analytics Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Comprehensive insights into protocol performance and risk metrics
            </p>
          </div>

          {/* Key Metrics */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Premiums (MTD)"
              value={`$${(totalPremiums / 1000).toFixed(0)}K`}
              change="+12.4% from last month"
              changeType="positive"
              icon={DollarSign}
            />
            <StatCard
              title="Total Claims (MTD)"
              value={`$${(totalClaims / 1000).toFixed(0)}K`}
              change={`${claimsRatio.toFixed(1)}% claims ratio`}
              changeType="neutral"
              icon={AlertCircle}
            />
            <StatCard
              title="Net Profit (MTD)"
              value={`$${(netProfit / 1000).toFixed(0)}K`}
              change={`${profitMargin.toFixed(1)}% margin`}
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Avg Pool Utilization"
              value="70.4%"
              change="Optimal range"
              changeType="positive"
              icon={Activity}
            />
          </div>

          {/* Charts Grid */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <AnalyticsChart
              data={premiumsVsClaimsData}
              title="Premiums vs Claims"
              type="bar"
              dataKeys={[
                { key: 'premiums', color: 'hsl(var(--primary))', name: 'Premiums' },
                { key: 'claims', color: 'hsl(var(--destructive))', name: 'Claims' },
              ]}
              valuePrefix="$"
            />

            <AnalyticsChart
              data={profitabilityData}
              title="Monthly Profitability"
              type="line"
              dataKeys={[
                { key: 'profit', color: 'hsl(var(--accent))', name: 'Net Profit' },
              ]}
              valuePrefix="$"
            />

            <AnalyticsChart
              data={utilizationData}
              title="Pool Utilization Trends"
              type="line"
              dataKeys={[
                { key: 'global', color: 'hsl(var(--primary))', name: 'Global' },
                { key: 'airline', color: 'hsl(var(--accent))', name: 'Airline' },
                { key: 'crowdFill', color: 'hsl(var(--chart-3))', name: 'Crowd-Fill' },
              ]}
              valueSuffix="%"
            />

            <AnalyticsChart
              data={delayRatesData}
              title="Delay Rates by Airline"
              type="line"
              dataKeys={[
                { key: 'emirates', color: '#3b82f6', name: 'Emirates' },
                { key: 'lufthansa', color: '#8b5cf6', name: 'Lufthansa' },
                { key: 'airIndia', color: '#ef4444', name: 'Air India' },
                { key: 'indigo', color: '#f59e0b', name: 'Indigo' },
                { key: 'qatar', color: '#10b981', name: 'Qatar' },
              ]}
              valueSuffix="%"
            />
          </div>

          {/* Detailed Analytics */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Airline Performance Rankings */}
            <div className="lg:col-span-2">
              <Card className="glass-card p-6">
                <h2 className="mb-6 text-xl font-bold">Airline Performance Rankings</h2>
                <div className="space-y-4">
                  {airlinePools
                    .sort((a, b) => b.onTime - a.onTime)
                    .map((airline, index) => {
                      const rank = index + 1;
                      const getRankColor = () => {
                        if (rank === 1) return 'text-accent';
                        if (rank === 2) return 'text-chart-5';
                        if (rank === 3) return 'text-chart-3';
                        return 'text-muted-foreground';
                      };

                      return (
                        <div
                          key={airline.id}
                          className="flex items-center gap-4 rounded-lg bg-secondary/30 p-4"
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl font-bold ${getRankColor()}`}
                          >
                            {rank}
                          </div>

                          <img
                            src={airline.logo || "/placeholder.svg"}
                            alt={airline.airline}
                            className="h-10 w-10 rounded-lg object-cover"
                          />

                          <div className="flex-1">
                            <p className="font-semibold">{airline.airline}</p>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {airline.onTime}% on-time
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {airline.delayRate}% delays
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {airline.apy}%
                            </p>
                            <p className="text-xs text-muted-foreground">APY</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </div>

            {/* Risk Metrics */}
            <div className="space-y-6">
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Risk Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Overall Delay Rate
                      </span>
                      <span className="font-semibold">12.4%</span>
                    </div>
                    <Progress value={12.4} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Cancellation Rate
                      </span>
                      <span className="font-semibold">2.1%</span>
                    </div>
                    <Progress value={2.1 * 10} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Claims Ratio</span>
                      <span className="font-semibold">{claimsRatio.toFixed(1)}%</span>
                    </div>
                    <Progress value={claimsRatio} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Protocol Health
                      </span>
                      <Badge className="bg-accent text-accent-foreground">
                        Excellent
                      </Badge>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Top Routes</h3>
                <div className="space-y-3">
                  {[
                    { route: 'DXB → LHR', volume: 125, claims: 8 },
                    { route: 'DEL → JFK', volume: 98, claims: 18 },
                    { route: 'FRA → SFO', volume: 87, claims: 12 },
                    { route: 'BOM → LHR', volume: 76, claims: 15 },
                    { route: 'DOH → LAX', volume: 65, claims: 6 },
                  ].map((route, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-primary" />
                        <span className="font-medium">{route.route}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{route.volume} policies</p>
                        <p className="text-xs text-muted-foreground">
                          {route.claims} claims
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Performance Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Premium per Policy</span>
                    <span className="font-semibold">$245</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Claim Size</span>
                    <span className="font-semibold">$1,850</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Policies Issued</span>
                    <span className="font-semibold">3,641</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Claims Filed</span>
                    <span className="font-semibold">241</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Claim Success Rate</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
