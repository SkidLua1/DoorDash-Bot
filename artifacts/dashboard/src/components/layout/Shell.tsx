import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Sidebar } from './Sidebar';
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from '@workspace/api-client-react';
import { getAuthHeaders } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export function Shell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Validate token on mount
  const { isError, isSuccess, isLoading } = useGetDashboardStats({
    query: {
      retry: false,
      enabled: !!localStorage.getItem("dashboard_token"),
      queryKey: getGetDashboardStatsQueryKey(),
    },
    request: { headers: getAuthHeaders() }
  });

  useEffect(() => {
    const token = localStorage.getItem("dashboard_token");
    if (!token) {
      setIsAuthenticated(false);
      if (location !== '/login') {
        setLocation('/login');
      }
    } else if (isError) {
      setIsAuthenticated(false);
      localStorage.removeItem("dashboard_token");
      if (location !== '/login') {
        setLocation('/login');
      }
    } else if (isSuccess) {
      setIsAuthenticated(true);
    }
  }, [isError, isSuccess, location, setLocation]);

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated && location !== '/login') {
    return null; // Will redirect
  }

  if (location === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}