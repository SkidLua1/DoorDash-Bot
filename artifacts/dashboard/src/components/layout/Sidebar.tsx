import React from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, ShoppingBag, Users, ShieldAlert, Image as ImageIcon, Coins, LogOut, Activity } from 'lucide-react';
import { cn } from '../ui';

const navItems = [
  { href: '/', label: 'Stats', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/accounts', label: 'Accounts', icon: ShieldAlert },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/touches', label: 'Touches', icon: ImageIcon },
  { href: '/credits', label: 'Credits', icon: Coins },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("dashboard_token");
    setLocation("/login");
  };

  const token = localStorage.getItem("dashboard_token") || "";
  const maskedToken = token.length > 8 ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : "No token";

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-sm tracking-tight">Mission Control</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between bg-background border border-border p-3 rounded-md mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Active Token</span>
            <span className="font-mono text-xs mt-0.5 text-foreground">{maskedToken}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </aside>
  );
}