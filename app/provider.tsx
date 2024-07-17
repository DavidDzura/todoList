'use client'
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import {ReactNode} from "react";

interface ProviderProps {
    children: ReactNode;
}

const queryClient = new QueryClient()

export default function Provider({children}: ProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
