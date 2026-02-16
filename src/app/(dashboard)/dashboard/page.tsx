'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Globe,
  Building2,
  BedDouble,
  Calendar,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores';
import { websiteApi, userApi } from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalUsers: 0,
    totalRooms: 0,
    totalHeroSections: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (user?.role === 'super_admin') {
          const [websitesRes, usersRes] = await Promise.all([
            websiteApi.getAll(),
            userApi.getAll(),
          ]);
          const websites = websitesRes.data.data.websites;
          const totalRooms = websites.reduce((sum: number, w: any) => sum + (w.rooms?.length || 0), 0);
          setStats({
            totalWebsites: websites.length,
            totalUsers: usersRes.data.data?.users?.length || 0,
            totalRooms,
            totalHeroSections: 0,
          });
        } else if (user?.role === 'admin' && user.websiteId) {
          const websiteRes = await websiteApi.getById(user.websiteId);
          const website = websiteRes.data.data.website;
          setStats({
            totalWebsites: 1,
            totalUsers: 0,
            totalRooms: website.rooms?.length || 0,
            totalHeroSections: website.heroSections?.length || 0,
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const quickStats = user?.role === 'super_admin'
    ? [
        {
          title: 'Active Websites',
          value: stats.totalWebsites,
          icon: <Globe className="h-6 w-6 text-blue-500" />,
          bgColor: 'bg-blue-500/10',
        },
        {
          title: 'Total Users',
          value: stats.totalUsers,
          icon: <Users className="h-6 w-6 text-green-500" />,
          bgColor: 'bg-green-500/10',
        },
        {
          title: 'Total Rooms',
          value: stats.totalRooms,
          icon: <BedDouble className="h-6 w-6 text-purple-500" />,
          bgColor: 'bg-purple-500/10',
        },
        {
          title: 'This Month',
          value: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          icon: <Calendar className="h-6 w-6 text-orange-500" />,
          bgColor: 'bg-orange-500/10',
        },
      ]
    : [
        {
          title: 'Your Website',
          value: user?.websiteName || 'N/A',
          icon: <Globe className="h-6 w-6 text-blue-500" />,
          bgColor: 'bg-blue-500/10',
        },
        {
          title: 'Rooms',
          value: stats.totalRooms,
          icon: <BedDouble className="h-6 w-6 text-green-500" />,
          bgColor: 'bg-green-500/10',
        },
        {
          title: 'Hero Sections',
          value: stats.totalHeroSections,
          icon: <ImageIcon className="h-6 w-6 text-purple-500" />,
          bgColor: 'bg-purple-500/10',
        },
        {
          title: 'This Month',
          value: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          icon: <Calendar className="h-6 w-6 text-orange-500" />,
          bgColor: 'bg-orange-500/10',
        },
      ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-lg bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="mt-1 opacity-90">
          {user?.role === 'super_admin'
            ? "Here's an overview of your platform."
            : `Managing ${user?.websiteName || 'your website'}.`}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Dashboard loaded</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
