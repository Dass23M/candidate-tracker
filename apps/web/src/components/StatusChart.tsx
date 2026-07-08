import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ApplicationStatus } from '@candidate-tracker/shared';

const statusColors: Record<ApplicationStatus, string> = {
  applied: '#94a3b8',
  screening: '#60a5fa',
  interview: '#818cf8',
  offer: '#fbbf24',
  hired: '#4ade80',
  rejected: '#f87171',
};

interface StatusChartProps {
  data: { status: ApplicationStatus; count: number }[];
}

export function StatusChart({ data }: StatusChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="status" tick={{ fontSize: 12 }} className="capitalize" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={statusColors[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Recharts requires Cell imported separately for per-bar coloring
import { Cell } from 'recharts';