import React from 'react';
import { useGetDashboardCredits } from '@workspace/api-client-react';
import { getAuthHeaders } from '../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui';
import { Coins, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function Credits() {
  const { data: credits, isLoading } = useGetDashboardCredits({
    request: { headers: getAuthHeaders() }
  });

  // Sort by balance descending
  const sortedCredits = React.useMemo(() => {
    if (!credits) return [];
    return [...credits].sort((a, b) => b.balance - a.balance);
  }, [credits]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ledger</h1>
        <p className="text-muted-foreground text-sm mt-1">Current credit balances for all active users.</p>
      </div>

      <div className="rounded-md border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Discord ID</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : sortedCredits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Coins className="w-8 h-8 mb-2 opacity-50" />
                    <p>No credit balances recorded.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedCredits.map((credit) => {
                const isZero = credit.balance === 0;
                return (
                  <TableRow 
                    key={credit.id}
                    className={isZero ? "bg-destructive/5 hover:bg-destructive/10" : ""}
                  >
                    <TableCell className="font-mono font-medium">
                      {credit.discordId}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`inline-flex items-center justify-end gap-1.5 font-mono font-bold ${isZero ? 'text-destructive' : 'text-primary'}`}>
                        {credit.balance}
                        <Coins className={`w-3.5 h-3.5 ${isZero ? 'text-destructive' : 'text-primary/70'}`} />
                      </div>
                      {isZero && (
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-destructive/80 uppercase font-semibold">
                          <AlertTriangle className="w-3 h-3" /> Depleted
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {format(new Date(credit.updatedAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}