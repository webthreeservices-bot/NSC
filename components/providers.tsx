'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import dynamic from 'next/dynamic';
const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || process.env.WEB3_DISABLED === 'true'

// Dynamically import WagmiConfig to avoid SSR issues (only when web3 enabled)
const WagmiConfig = !WEB3_DISABLED
  ? dynamic(() => import('wagmi').then(mod => mod.WagmiConfig), { ssr: false })
  : null

function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  useTokenRefresh();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [wagmiConfig, setWagmiConfig] = useState<any>(null);

  useEffect(() => {
    // Only load wagmi config on client side
    if (typeof window !== 'undefined' && !WEB3_DISABLED) {
      import('@/lib/wagmi-config').then(({ wagmiConfig }) => {
        setWagmiConfig(wagmiConfig);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TokenRefreshProvider>
        {wagmiConfig ? (
          <WagmiConfig config={wagmiConfig}>
            {children}
          </WagmiConfig>
        ) : (
          children
        )}
      </TokenRefreshProvider>
    </QueryClientProvider>
  );
}
