"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { truncateAddress } from "@/lib/format";
import { useWallet } from "@/components/wallet-provider";

type ConnectButtonProps = {
  className?: string;
  connectedLabel?: "address" | "launch";
  onConnected?: () => void;
  onDisconnected?: () => void;
  showDropdown?: boolean;
};

export function ConnectButton({
  className,
  connectedLabel = "address",
  onConnected,
  onDisconnected,
  showDropdown = false,
}: ConnectButtonProps) {
  const { address, chainId, connect, disconnect, isConnected, isConnecting } =
    useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const label = useMemo(() => {
    if (isConnecting) return "Connecting...";
    if (isConnected && address) {
      return connectedLabel === "launch"
        ? "Open Dashboard"
        : truncateAddress(address);
    }
    return "Connect Wallet";
  }, [address, connectedLabel, isConnected, isConnecting]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  async function handleClick() {
    if (isConnected) {
      if (showDropdown && connectedLabel === "address") {
        setMenuOpen((current) => !current);
        return;
      }
      onConnected?.();
      return;
    }

    await connect();
    onConnected?.();
  }

  function handleDisconnect() {
    setMenuOpen(false);
    disconnect();
    onDisconnected?.();
  }

  return isConnected ? (
    <div
      className={className}
      ref={containerRef}
      style={{ display: "flex", gap: "0.6rem", position: "relative" }}
    >
      <button className="btn-primary" onClick={handleClick} type="button">
        {label}
        {showDropdown && connectedLabel === "address" ? " ▾" : ""}
      </button>
      {showDropdown && connectedLabel === "address" && menuOpen ? (
        <div className="wallet-menu">
          <button className="wallet-menu-item" onClick={handleDisconnect} type="button">
            Disconnect wallet
          </button>
        </div>
      ) : null}
    </div>
  ) : (
    <button
      aria-busy={isConnecting}
      className={className ? `btn-primary ${className}` : "btn-primary"}
      disabled={isConnecting}
      onClick={handleClick}
      type="button"
    >
      {label}
    </button>
  );
}
