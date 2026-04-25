"use client";

import { Toaster } from "sonner";
import { WalletProvider } from "@/components/wallet-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
        {children}
        <Toaster richColors position="top-right" />
    </WalletProvider>
  );
}
