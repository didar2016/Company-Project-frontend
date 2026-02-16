'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HotelsPage() {
  const router = useRouter();

  useEffect(() => {
    // Hotels are now embedded in Website. Redirect to dashboard.
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
