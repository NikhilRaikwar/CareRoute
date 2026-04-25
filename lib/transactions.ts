import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ARC_CONFIG, ARC_TESTNET } from "@/lib/arc";
import type { SpecialistName, TransactionRecord } from "@/lib/types";

const agentRecipients: Record<SpecialistName | "verifier" | "orchestrator", `0x${string}` | undefined> = {
  orchestrator: process.env.ORCHESTRATOR_ADDRESS as `0x${string}` | undefined,
  cardiology: process.env.CARDIOLOGY_AGENT_ADDRESS as `0x${string}` | undefined,
  neurology: process.env.NEUROLOGY_AGENT_ADDRESS as `0x${string}` | undefined,
  respiratory: process.env.RESPIRATORY_AGENT_ADDRESS as `0x${string}` | undefined,
  general: process.env.GENERAL_AGENT_ADDRESS as `0x${string}` | undefined,
  verifier: process.env.VERIFIER_AGENT_ADDRESS as `0x${string}` | undefined,
};

type PayAgentArgs = {
  to: SpecialistName | "verifier";
  amount: number;
};

function mockHash() {
  const random = Math.random().toString(16).slice(2).padEnd(16, "0");
  return `0x${random}`.slice(0, 14) + "..." + `${Math.floor(Math.random() * 9000 + 1000)}`;
}

export async function payAgent({
  to,
  amount,
}: PayAgentArgs): Promise<TransactionRecord> {
  const recipient = agentRecipients[to];
  return sendOrchestratorTransfer({
    to: recipient,
    amount,
    label: to,
  });
}

export async function refundUserBudget({
  to,
  amount,
}: {
  to: `0x${string}`;
  amount: number;
}) {
  return sendOrchestratorTransfer({
    to,
    amount,
    label: "refund",
    fromLabel: "orch",
  });
}

async function sendOrchestratorTransfer({
  to,
  amount,
  label,
  fromLabel = "orch",
}: {
  to?: `0x${string}`;
  amount: number;
  label: string;
  fromLabel?: string;
}): Promise<TransactionRecord> {
  const pk = process.env.ORCHESTRATOR_PRIVATE_KEY as `0x${string}` | undefined;

  if (!pk) {
    throw new Error("Missing ORCHESTRATOR_PRIVATE_KEY.");
  }

  if (!pk.startsWith("0x") || pk.length !== 66) {
    throw new Error(
      "ORCHESTRATOR_PRIVATE_KEY is invalid. Expected a 0x-prefixed 32-byte private key.",
    );
  }

  if (!to) {
    throw new Error(`Missing recipient address for ${label}. Check agent wallet env vars.`);
  }

  if (!isAddress(to)) {
    throw new Error(`Invalid recipient address for ${label}: ${to}`);
  }

  let account;
  try {
    account = privateKeyToAccount(pk);
  } catch {
    throw new Error("Failed to parse ORCHESTRATOR_PRIVATE_KEY.");
  }
  const publicClient = createPublicClient({
    chain: ARC_TESTNET,
    transport: http(ARC_CONFIG.rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain: ARC_TESTNET,
    transport: http(ARC_CONFIG.rpcUrl),
  });

  const hash = await walletClient.sendTransaction({
    account,
    to,
    value: parseUnits(amount.toFixed(6), 18),
    chain: ARC_TESTNET,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return {
    hash,
    from: fromLabel,
    to: label,
    amount,
    status: "confirmed",
    explorerUrl: `${ARC_CONFIG.explorer}/tx/${hash}`,
  };
}
