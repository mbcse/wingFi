import { SidebarNav } from '@/components/sidebar-nav';
import { Topbar } from '@/components/topbar';
import { FlightTicker } from '@/components/flight-ticker';
import { CrowdFillCard } from '@/components/crowd-fill-card';
import { crowdFillPolicies } from '@/lib/mock-data';
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

export default function CrowdFillPage() {
  const totalRequired = crowdFillPolicies.reduce(
    (sum, p) => sum + p.coverageRequired,
    0
  );
  const totalFilled = crowdFillPolicies.reduce((sum, p) => sum + p.coverageFilled, 0);
  const avgReturn =
    crowdFillPolicies.reduce(
      (sum, p) => sum + (p.premium / p.coverageRequired) * 100,
      0
    ) / crowdFillPolicies.length;

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <Topbar />
      <FlightTicker />

      <main className="ml-64 pt-28">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-balance">Crowd-Fill Marketplace</h1>
            <p className="mt-2 text-muted-foreground">
              Fund individual policies and earn premium returns
            </p>
          </div>

          {/* Summary Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Open Policies</p>
              <p className="mt-2 text-3xl font-bold">{crowdFillPolicies.length}</p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Total Coverage Needed</p>
              <p className="mt-2 text-3xl font-bold">
                ${(totalRequired / 1000).toFixed(0)}K
              </p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Total Funded</p>
              <p className="mt-2 text-3xl font-bold">
                ${(totalFilled / 1000).toFixed(1)}K
              </p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Avg. Expected Return</p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {avgReturn.toFixed(2)}%
              </p>
            </Card>
          </div>

          {/* Info Banner */}
          <Card className="glass-card mb-8 p-6">
            <h3 className="mb-2 text-lg font-semibold">How Crowd-Fill Works</h3>
            <p className="text-sm text-muted-foreground">
              Crowd-Fill allows you to directly underwrite individual policies. When a user 
              purchases insurance, their policy needs to be backed by capital. You provide 
              that capital and earn the premium if no claim occurs. Higher risk flights offer 
              higher returns but come with increased claim probability.
            </p>
          </Card>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by flight number or route..." className="pl-9" />
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
            <Select defaultValue="time">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time Left</SelectItem>
                <SelectItem value="return">Highest Return</SelectItem>
                <SelectItem value="amount">Lowest Amount</SelectItem>
                <SelectItem value="filled">Most Filled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Crowd-Fill Cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {crowdFillPolicies.map((policy) => (
              <CrowdFillCard key={policy.id} policy={policy} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
