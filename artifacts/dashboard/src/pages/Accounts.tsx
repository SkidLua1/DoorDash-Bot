import React from 'react';
import { useGetDashboardAccounts, useToggleDashboardAccount, getGetDashboardAccountsQueryKey } from '@workspace/api-client-react';
import { getAuthHeaders } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent, Switch, Skeleton, Badge } from '../components/ui';
import { ShieldCheck, ShieldAlert, Mail, Calendar } from 'lucide-react';
import { safeFormat } from '../lib/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

export default function Accounts() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading } = useGetDashboardAccounts({
    request: { headers: getAuthHeaders() }
  });

  const toggleAccount = useToggleDashboardAccount({
    request: { headers: getAuthHeaders() },
    mutation: {
      onMutate: async ({ id }) => {
        const queryKey = getGetDashboardAccountsQueryKey();
        await queryClient.cancelQueries({ queryKey });
        
        const previousAccounts = queryClient.getQueryData(queryKey);
        
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return old.map((acc: any) => 
            acc.id === id ? { ...acc, isActive: !acc.isActive } : acc
          );
        });

        return { previousAccounts };
      },
      onError: (err, variables, context) => {
        if (context?.previousAccounts) {
          queryClient.setQueryData(getGetDashboardAccountsQueryKey(), context.previousAccounts);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetDashboardAccountsQueryKey() });
      }
    }
  });

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supply Nodes</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage connected DoorDash accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-card">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : !accounts || accounts.length === 0 ? (
          <div className="col-span-full py-12 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center text-center bg-card/20">
            <ShieldAlert className="w-8 h-8 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground">No accounts detected</h3>
            <p className="text-sm text-muted-foreground mt-1">Add one via <code className="bg-muted px-1 py-0.5 rounded text-primary">/addaccount</code> in Discord.</p>
          </div>
        ) : (
          accounts.map(account => (
            <Card 
              key={account.id} 
              className={`transition-all duration-200 border-border/50 hover:shadow-lg hover:-translate-y-1 ${!account.isActive ? 'opacity-70 grayscale-[30%]' : ''}`}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    {account.name}
                    {account.isActive ? (
                      <Badge variant="success" className="px-1.5 py-0 rounded text-[10px]">ACTIVE</Badge>
                    ) : (
                      <Badge variant="secondary" className="px-1.5 py-0 rounded text-[10px]">OFFLINE</Badge>
                    )}
                  </CardTitle>
                </div>
                <Switch 
                  checked={account.isActive} 
                  onCheckedChange={() => toggleAccount.mutate({ id: account.id })}
                  disabled={toggleAccount.isPending}
                />
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="font-mono">{maskEmail(account.email)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Added {safeFormat(account.createdAt, "MMM d, yyyy")}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-border/50 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">ID: {account.id}</span>
                  <span className="text-muted-foreground">Added by: <span className="text-foreground">{account.addedBy}</span></span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
