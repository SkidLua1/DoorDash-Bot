import React from 'react';
import { useGetDashboardOrders } from '@workspace/api-client-react';
import { getAuthHeaders } from '../lib/api';
import { Badge, Skeleton } from '../components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { safeFormat } from '../lib/dateUtils';
import { ExternalLink, Link2Off } from 'lucide-react';

export default function Orders() {
  const { data: orders, isLoading } = useGetDashboardOrders(
    { limit: 20, offset: 0 },
    { request: { headers: getAuthHeaders() } }
  );

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('paid') || s.includes('complete') || s.includes('success')) {
      return <Badge variant="success">Paid</Badge>;
    }
    if (s.includes('fail') || s.includes('error') || s.includes('cancel')) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="warning">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Feed</h1>
        <p className="text-muted-foreground text-sm mt-1">Recent delivery requests processed by the network.</p>
      </div>

      <div className="rounded-md border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Store</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : !orders || orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No orders found in the system.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="group">
                  <TableCell className="font-mono text-muted-foreground">#{order.id}</TableCell>
                  <TableCell className="font-medium">
                    {order.discordId}
                  </TableCell>
                  <TableCell>{order.storeName || <span className="text-muted-foreground opacity-50">Unknown</span>}</TableCell>
                  <TableCell className="text-right font-mono">${(order.totalCents / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{order.creditsUsed}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {order.trackingUrl ? (
                      <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                        Track <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/50 flex items-center gap-1 text-sm">
                        <Link2Off className="w-3 h-3" /> N/A
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm whitespace-nowrap">
                    {safeFormat(order.createdAt, "MMM d, HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
