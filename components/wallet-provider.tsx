"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPublicClient, formatUnits, http, parseUnits } from "viem";
import { ARC_TESTNET } from "@/lib/arc";

type WalletContextValue = {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: (account?: string | null) => Promise<void>;
  sendNativeUsdc: (to: string, amount: number) => Promise<string>;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const walletContext = createContext<WalletContextValue | null>(null);
const storageKey = "careroute.wallet";

const publicClient = createPublicClient({
  chain: ARC_TESTNET,
  transport: http(ARC_TESTNET.rpcUrls.default.http[0]),
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshBalance = useCallback(async (account?: string | null) => {
    const target = account ?? address;
    if (!target) {
      setBalance(null);
      return;
    }

    try {
      const nextBalance = await publicClient.getBalance({
        address: target as `0x${string}`,
      });
      setBalance(formatUnits(nextBalance, 18));
    } catch {
      setBalance(null);
    }
  }, [address]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setBalance(null);
    localStorage.removeItem(storageKey);
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("No injected wallet found. Install MetaMask or a compatible wallet.");
    }

    setIsConnecting(true);

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${ARC_TESTNET.id.toString(16)}`,
            chainName: ARC_TESTNET.name,
            nativeCurrency: ARC_TESTNET.nativeCurrency,
            rpcUrls: ARC_TESTNET.rpcUrls.default.http,
            blockExplorerUrls: [ARC_TESTNET.blockExplorers.default.url],
          },
        ],
      });

      const hexChainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;

      const nextAddress = accounts[0] ?? null;
      const nextChainId = Number.parseInt(hexChainId, 16);

      setAddress(nextAddress);
      setChainId(nextChainId);
      localStorage.setItem(storageKey, JSON.stringify({ address: nextAddress }));
      await refreshBalance(nextAddress);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  const sendNativeUsdc = useCallback(
    async (to: string, amount: number) => {
      if (!window.ethereum || !address) {
        throw new Error("Connect a wallet before funding a case.");
      }
      if (!to) {
        throw new Error("NEXT_PUBLIC_ORCHESTRATOR_ADDRESS is missing.");
      }

      const hash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to,
            value: `0x${parseUnits(amount.toFixed(6), 18).toString(16)}`,
          },
        ],
      })) as string;

      await publicClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
      });
      await refreshBalance(address);
      return hash;
    },
    [address, refreshBalance],
  );

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;

    const restore = async () => {
      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];
      const hexChainId = (await provider.request({
        method: "eth_chainId",
      })) as string;
      const nextAddress = accounts[0] ?? null;
      const nextChainId = Number.parseInt(hexChainId, 16);

      setAddress(nextAddress);
      setChainId(nextChainId);
      await refreshBalance(nextAddress);
    };

    void restore();

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAddress = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined;
      setAddress(nextAddress ?? null);
      void refreshBalance(nextAddress ?? null);
      if (!nextAddress) {
        localStorage.removeItem(storageKey);
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      if (typeof chainIdHex === "string") {
        setChainId(Number.parseInt(chainIdHex, 16));
      }
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [refreshBalance]);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      chainId,
      isConnected: Boolean(address),
      isConnecting,
      balance,
      connect,
      disconnect,
      refreshBalance,
      sendNativeUsdc,
    }),
    [
      address,
      balance,
      chainId,
      connect,
      disconnect,
      isConnecting,
      refreshBalance,
      sendNativeUsdc,
    ],
  );

  return (
    <walletContext.Provider value={value}>{children}</walletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(walletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
