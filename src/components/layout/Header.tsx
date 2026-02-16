'use client';

import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores';

interface HeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
      <div className="flex items-center gap-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {item.href ? (
                  <a href={item.href} className="hover:text-foreground">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9"
          />
        </div>

        {/* Website name for admin users */}
        {user?.role === 'admin' && user.websiteName && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {user.websiteName}
          </div>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <Button variant="ghost" size="icon" className="rounded-full">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
