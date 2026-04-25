import { defineChain, http } from "viem";

export const ARC_TESTNET = defineChain({
  id: 5_042_002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arcscan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

export const ARC_CONFIG = {
  chain: ARC_TESTNET,
  explorer: "https://testnet.arcscan.app",
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network",
  usdcAddress: "0x3600000000000000000000000000000000000000" as const,
  identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const,
  reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713" as const,
  validationRegistry: "0x8004Cb1BF31DAf7788923b405b754f57acEB4272" as const,
} as const;

export const arcTransport = http(ARC_CONFIG.rpcUrl);
