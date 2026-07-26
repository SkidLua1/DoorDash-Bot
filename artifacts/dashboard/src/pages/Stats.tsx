import React from 'react';
import { useGetDashboardStats } from '@workspace/api-client-react';
import { getAuthHeaders } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '../components/ui';
import { ShoppingBag, Users, Activity, Touchpad, Coins, DollarSign } from 'lucide-react';

export default function Stats() {
  const { data, isLoading } = useGetDashboardStats({
    request: { headers: getAuthHeaders() }
  });

  const stats = [
    { label: "Total Orders", value: data?.totalOrders, icon: ShoppingBag, formatter: (v: number) => v.toLocaleString() },
    { label: "Total Revenue", value: data?.totalRevenueCents, icon: DollarSign, formatter: (v: number) => `$${(v / 100).toFixed(2)}` },
    { label: "Active Accounts", value: data?.activeAccounts, icon: Activity, formatter: (v: number) => v.toString() },
    { label: "Authorized Users", value: data?.totalAuthorizedUsers, icon: Users, formatter: (v: number) => v.toString() },
    { label: "Total Touches", value: data?.totalTouches, icon: Touchpad, formatter: (v: number) => v.toString() },
    { label: "Credits in Circulation", value: data?.totalCreditsHeld, icon: Coins, formatter: (v: number) => v.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Statistics</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time overview of bot operations and economy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card/40 border-border/50 hover:bg-card transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
                  {stat.value !== undefined ? stat.formatter(stat.value) : '0'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-border/50 bg-card/20 overflow-hidden relative min-h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/50 rounded-lg bg-background/50 backdrop-blur-sm">
          <Activity className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-semibold text-muted-foreground">Order Activity</h3>
          <p className="text-xs text-muted-foreground/70 max-w-sm mt-1">
            Historical order volume visualization will be deployed in a future uplink update.
          </p>
        </div>
      </Card>
    </div>
  );
}