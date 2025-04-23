"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5,
                        gcTime: 1000 * 60 * 10,
                        refetchOnWindowFocus: true,
                        retry: 1,
                    },
                },
            }),
    );

    return (
        <>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster position="top-right" richColors />
            </QueryClientProvider>
        </>
    );
}