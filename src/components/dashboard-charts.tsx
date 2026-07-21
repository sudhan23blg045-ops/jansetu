"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartProps {
  statusData: { name: string; value: number }[];
  monthlyData: { month: string; count: number }[];
}

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6'];

export function DashboardCharts({ statusData, monthlyData }: ChartProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Applications by Status */}
      <div className="flex flex-col h-[280px] w-full">
        <h3 className="text-sm font-semibold mb-4 text-center text-muted-foreground">Applications by Status</h3>
        <div className="flex-1 min-h-0 relative">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <div className="h-6 w-6 rounded-full border-4 border-muted-foreground/30 border-t-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-foreground">No data available</p>
              <p className="text-xs text-muted-foreground">Submit applications to see your stats.</p>
            </div>
          )}
        </div>
      </div>

      {/* Applications per Month */}
      <div className="flex flex-col h-[280px] w-full">
        <h3 className="text-sm font-semibold mb-4 text-center text-muted-foreground">Applications per Month</h3>
        <div className="flex-1 min-h-0 relative">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 flex-row items-end gap-1 p-3">
                <div className="w-1.5 h-3 bg-muted-foreground/30 rounded-t-sm" />
                <div className="w-1.5 h-6 bg-muted-foreground/50 rounded-t-sm" />
                <div className="w-1.5 h-4 bg-muted-foreground/40 rounded-t-sm" />
              </div>
              <p className="text-sm font-medium text-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground">Your monthly timeline will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
