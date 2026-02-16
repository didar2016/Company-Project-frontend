'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, Header } from '@/components/layout';
import { useAuthStore, useWebsiteStore } from '@/stores';
import { toast } from '@/hooks/use-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, getMe, isLoading: authLoading, forceLogout } = useAuthStore();
  const { fetchWebsites } = useWebsiteStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token and get user data
    getMe().then(() => {
      fetchWebsites();
    }).catch(() => {
      forceLogout('Your session has expired. Please log in again.');
      router.push('/login');
    });
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
