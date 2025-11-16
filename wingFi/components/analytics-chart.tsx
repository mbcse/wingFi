'use client';

import { Card } from './ui/card';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

interface AnalyticsChartProps {
  data: Array<Record<string, string | number>>;
  title: string;
  type?: 'line' | 'bar';
  dataKeys: Array<{ key: string; color: string; name: string }>;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function AnalyticsChart({
  data,
  title,
  type = 'line',
  dataKeys,
  valuePrefix = '',
  valueSuffix = '',
}: AnalyticsChartProps) {
  const ChartComponent = type === 'bar' ? BarChart : LineChart;

  // Define visible colors
  const colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <Card className="glass-card p-6">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${valuePrefix}${value.toFixed(0)}${valueSuffix}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value: number, name: string) => [
              `${valuePrefix}${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}${valueSuffix}`,
              name,
            ]}
          />
          <Legend 
            wrapperStyle={{ color: '#94a3b8' }}
          />
          {dataKeys.map((dataKey, index) =>
            type === 'bar' ? (
              <Bar
                key={dataKey.key}
                dataKey={dataKey.key}
                fill={colors[index] || dataKey.color}
                name={dataKey.name}
              />
            ) : (
              <Line
                key={dataKey.key}
                type="monotone"
                dataKey={dataKey.key}
                stroke={colors[index] || dataKey.color}
                strokeWidth={3}
                dot={{ fill: colors[index] || dataKey.color, r: 4 }}
                name={dataKey.name}
              />
            )
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </Card>
  );
}
