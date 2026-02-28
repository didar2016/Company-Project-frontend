'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  ImageIcon,
  Sparkles,
  LogOut,
  Palette,
  BookOpen,
  Building,
  Star,
  Loader2,
  Contact,
  MailOpen,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin'],
  },
  {
    title: 'Websites',
    href: '/dashboard/websites',
    icon: Globe,
    roles: ['super_admin'],
  },
  {
    title: 'Rooms',
    href: '/dashboard/rooms',
    icon: BedDouble,
    roles: ['admin'],
  },
  {
    title: 'Hero Sections',
    href: '/dashboard/hero-sections',
    icon: ImageIcon,
    roles: ['admin'],
  },
  {
    title: 'Site Settings',
    href: '/dashboard/site-settings',
    icon: Palette,
    roles: ['admin'],
  },
  {
    title: 'Our Story',
    href: '/dashboard/our-story',
    icon: BookOpen,
    roles: ['admin'],
  },
  {
    title: 'Facilities',
    href: '/dashboard/facilities',
    icon: Building,
    roles: ['admin'],
  },
  {
    title: 'Reviews',
    href: '/dashboard/reviews',
    icon: Star,
    roles: ['admin'],
  },
  {
    title: 'Offers',
    href: '/dashboard/offers',
    icon: Tag,
    roles: ['admin'],
  },
  {
    title: 'Contact Info',
    href: '/dashboard/contact-info',
    icon: Contact,
    roles: ['admin'],
  },
  {
    title: 'Emails',
    href: '/dashboard/emails',
    icon: MailOpen,
    roles: ['admin'],
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: ['super_admin'],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-card border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">HotelHub</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {!isHydrated ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            // Hide menu items based on user role
            if (!item.roles.includes(user?.role || '')) {
              return null;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t">
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn('w-full', collapsed && 'px-2')}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
