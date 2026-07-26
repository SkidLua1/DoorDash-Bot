import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button, Input, Card } from '../components/ui';
import { Activity, KeyRound } from 'lucide-react';
import { getDashboardStats } from '@workspace/api-client-react';

export default function Auth() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Direct call to validate token
      await getDashboardStats({ headers: { "x-dashboard-token": token } });
      localStorage.setItem("dashboard_token", token);
      setLocation('/');
    } catch (err) {
      setError('Invalid or unauthorized token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl"></div>
            <Activity className="w-8 h-8 text-primary relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Restricted Access</h1>
          <p className="text-muted-foreground text-sm">Enter your operator token to establish secure link.</p>
        </div>

        <Card className="p-1 border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <KeyRound className="w-3 h-3" />
                Access Token
              </label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="••••••••••••••••"
                className="font-mono bg-background/50 h-12 text-lg px-4 focus-visible:ring-primary/50"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md font-medium text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold tracking-wide mt-2"
              disabled={loading || !token.trim()}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'INITIALIZE UPLINK'
              )}
            </Button>
          </form>
        </Card>
      </div>
      
      <div className="fixed bottom-6 text-xs font-mono text-muted-foreground opacity-50">
        SYS.SEC.GATEWAY_v1.0.0
      </div>
    </div>
  );
}