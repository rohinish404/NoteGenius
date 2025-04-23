// components/Providers.tsx
"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner"; // Make sure Sonner is here too

export function Providers({ children }: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient is only created once per component instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default staleTime: 0 means data is considered stale immediately
            // Setting a staleTime means data won't be refetched automatically
            // until this time passes. Good for data that doesn't change often.
            staleTime: 1000 * 60 * 5, // 5 minutes
            // gcTime (previously cacheTime) controls how long inactive query data
            // is kept in memory. Default is 5 minutes.
            gcTime: 1000 * 60 * 10, // 10 minutes
             refetchOnWindowFocus: true, // Refetch when window gains focus (good default)
             retry: 1, // Retry failed requests once
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors /> {/* Position Sonner Toaster */}
    </QueryClientProvider>
  );
}