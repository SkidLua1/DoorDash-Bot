import React from 'react';
import { useGetDashboardUsers } from '@workspace/api-client-react';
import { getAuthHeaders } from '../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui';
import { Users as UsersIcon, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function Users() {
  const { data: users, isLoading } = useGetDashboardUsers({
    request: { headers: getAuthHeaders() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Authorized Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">Discord users with access to the bot.</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-md text-sm font-medium border border-primary/20 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>{users?.length || 0} Total Active</span>
        </div>
      </div>

      <div className="rounded-md border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Discord ID</TableHead>
              <TableHead>Added By</TableHead>
              <TableHead className="text-right">Granted Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : !users || users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UsersIcon className="w-8 h-8 mb-2 opacity-50" />
                    <p>No authorized users found.</p>
                    <p className="text-xs mt-1">Use <code className="bg-muted px-1 rounded">/adduser</code> in Discord to grant access.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">
                    {user.discordUsername}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm">
                    {user.discordId}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.addedBy}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {format(new Date(user.addedAt), "MMM d, yyyy")}
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