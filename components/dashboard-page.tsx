"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConnectButton } from "@/components/connect-button";
import { ARC_CONFIG, ARC_TESTNET } from "@/lib/arc";
import { cn, formatUsdc, truncateAddress } from "@/lib/format";
import type { CaseRunResult, CaseSummary, TransactionRecord } from "@/lib/types";
import { useWallet } from "@/components/wallet-provider";

const CASE_BUDGET = 0.02;

export function DashboardPage() {
  const router = useRouter();
  const { address, balance, chainId, disconnect, isConnected, sendNativeUsdc } =
    useWallet();

  const [symptoms, setSymptoms] = useState("");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [latestResult, setLatestResult] = useState<CaseRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [funding, setFunding] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [caseBudget, setCaseBudget] = useState(0);
  const [budgetTxHash, setBudgetTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  const totalSettled = useMemo(
    () =>
      transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );

  const metrics = useMemo(
    () => ({
      casesProcessed: cases.length,
      onchainTransactions: transactions.length,
      totalSettled,
      averageCost:
        cases.length > 0
          ? cases.reduce((sum, caseItem) => sum + caseItem.totalCost, 0) /
            cases.length
          : 0,
      remainingBudget: Math.max(caseBudget, 0),
    }),
    [caseBudget, cases, totalSettled, transactions.length],
  );

  async function fundCaseBudget() {
    if (!address) return;
    setFunding(true);
    setError(null);

    try {
      const hash = await sendNativeUsdc(
        process.env.NEXT_PUBLIC_ORCHESTRATOR_ADDRESS ?? "",
        CASE_BUDGET,
      );
      setCaseBudget((current) => current + CASE_BUDGET);
      setBudgetTxHash(hash);
      toast.success("Case budget funded on Arc Testnet.");
    } catch (fundError) {
      const message =
        fundError instanceof Error ? fundError.message : "Funding failed.";
      setError(message);
      toast.error(message);
    } finally {
      setFunding(false);
    }
  }

  async function refundBudget() {
    if (!address || caseBudget <= 0) return;
    setRefunding(true);
    setError(null);

    try {
      const response = await fetch("/api/refund-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          amount: Number(caseBudget.toFixed(6)),
        }),
      });

      const payload = (await response.json()) as TransactionRecord | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Refund failed.");
      }

      setTransactions((current) => [payload, ...current].slice(0, 50));
      setCaseBudget(0);
      setBudgetTxHash(null);
      toast.success("Remaining budget refunded.");
    } catch (refundError) {
      const message =
        refundError instanceof Error ? refundError.message : "Refund failed.";
      setError(message);
      toast.error(message);
    } finally {
      setRefunding(false);
    }
  }

  async function runCase() {
    if (caseBudget < 0.006) {
      toast.error("Fund a case budget before running the workflow.");
      return;
    }

    setRunning(true);
    setError(null);
    setLatestResult(null);
    setActiveStep(1);

    try {
      const response = await fetch("/api/run-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms,
          walletAddress: address,
          budgetTxHash,
        }),
      });

      const payload = (await response.json()) as CaseRunResult | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Run failed");
      }

      setLatestResult(payload);
      setTransactions((current) => [...payload.transactions, ...current].slice(0, 50));
      setCases((current) => [payload.summary, ...current].slice(0, 12));
      setCaseBudget((current) =>
        Math.max(Number((current - payload.totalCost).toFixed(6)), 0),
      );
      setActiveStep(5);
      toast.success("Case completed and settled on Arc.");
    } catch (runError) {
      const message =
        runError instanceof Error ? runError.message : "Case execution failed.";
      setError(message);
      toast.error(message);
    } finally {
      setRunning(false);
      window.setTimeout(() => setActiveStep(0), 1200);
    }
  }

  function disconnectAndExit() {
    disconnect();
    router.replace("/");
  }

  if (!isConnected) {
    return null;
  }

  return (
    <div className="dash">
      <div className="topbar">
        <div className="logo">
          Care<span>Route</span>{" "}
          <span className="dashboard-wordmark">dashboard</span>
        </div>
        <div className="topbar-actions">
          <div className="network-badge">
            <div className="live-dot" />
            Arc Testnet · USDC
          </div>
          <div className="wallet-chip">
            {truncateAddress(address ?? "")} ·{" "}
            {balance ? `${Number(balance).toFixed(3)} USDC` : "—"}
          </div>
          <ConnectButton
            connectedLabel="address"
            onDisconnected={disconnectAndExit}
            showDropdown
          />
        </div>
      </div>

      <div className="care-layout">
        <aside className="care-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Case budget</div>
            <div className="budget-card">
              <div className="budget-amount">{formatUsdc(metrics.remainingBudget)}</div>
              <div className="budget-copy">remaining user-funded balance</div>
              <div className="budget-actions">
                <button
                  className="btn-primary"
                  disabled={funding || chainId !== ARC_TESTNET.id}
                  onClick={fundCaseBudget}
                  type="button"
                >
                  {funding ? "Funding…" : `Fund ${formatUsdc(CASE_BUDGET)}`}
                </button>
                <button
                  className="btn-outline"
                  disabled={refunding || caseBudget <= 0}
                  onClick={refundBudget}
                  type="button"
                >
                  {refunding ? "Refunding…" : "Refund Remaining"}
                </button>
              </div>
              <div className="budget-note">
                Funds move from the connected wallet to the orchestrator wallet on Arc,
                then specialist agents consume budget per step.
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Workflow pricing</div>
            <div className="pricing-list">
              <div className="pricing-row">
                <span>Intake summarization</span>
                <strong>$0.001</strong>
              </div>
              <div className="pricing-row">
                <span>Specialist review</span>
                <strong>$0.002</strong>
              </div>
              <div className="pricing-row">
                <span>Verifier / second opinion</span>
                <strong>$0.001</strong>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Protocol</div>
            <div className="protocol-block">
              <div>
                settlement: <span>Arc L1</span>
              </div>
              <div>
                payer: <span>connected user wallet</span>
              </div>
              <div>
                router: <span>AI/ML API</span>
              </div>
              <div>
                chain: <span>{ARC_TESTNET.id}</span>
              </div>
              <div>
                explorer: <span>Arcscan</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="care-main">
          <div className="page-heading">
            <div>
              <div className="section-label">Clinical workflow assistant</div>
              <h1 className="dashboard-title">User-funded intake routing</h1>
              <p className="dashboard-subtitle">
                Connect a wallet, fund a case budget, then run a real Arc-settled
                triage workflow with specialist agents and structured risk flags.
              </p>
            </div>
            <a className="btn-outline" href={ARC_CONFIG.explorer} rel="noreferrer" target="_blank">
              Open Arc Explorer
            </a>
          </div>

          <div className="metrics-row refined">
            <div className="metric">
              <div className="metric-val teal">{metrics.casesProcessed}</div>
              <div className="metric-label">cases settled</div>
            </div>
            <div className="metric">
              <div className="metric-val">{metrics.onchainTransactions}</div>
              <div className="metric-label">real transactions</div>
            </div>
            <div className="metric">
              <div className="metric-val amber">{formatUsdc(metrics.totalSettled)}</div>
              <div className="metric-label">USDC settled</div>
            </div>
            <div className="metric">
              <div className="metric-val teal">{formatUsdc(metrics.averageCost)}</div>
              <div className="metric-label">avg case cost</div>
            </div>
          </div>

          <section className="panel run-panel">
            <div className="panel-title">
              Start case <span className="panel-badge">real settlement only</span>
            </div>
            <label className="field-label" htmlFor="symptoms">
              Symptom intake
            </label>
            <textarea
              className="symptom-textarea"
              id="symptoms"
              onChange={(event) => setSymptoms(event.target.value)}
              placeholder="Describe symptoms, duration, severity, and any context the specialist agents should review."
              value={symptoms}
            />
            <div className="run-footer">
              <div className="agent-flow compact">
                {[
                  ["patient", "🧑"],
                  ["orchestrator", "🎛️"],
                  ["specialists", "🧠"],
                  ["verifier", "✅"],
                ].map(([name, icon], index) => (
                  <div className="agent-flow-item" key={name}>
                    <div className="af-node">
                      <div
                        className={cn(
                          "af-circle",
                          activeStep === index + 1 && "active",
                          activeStep > index + 1 && "done",
                        )}
                      >
                        {icon}
                      </div>
                      <div className="af-name">{name}</div>
                    </div>
                    {index < 3 ? <div className="af-arrow">→</div> : null}
                  </div>
                ))}
              </div>
              <button
                aria-busy={running}
                className="run-btn"
                disabled={running || !symptoms.trim() || caseBudget <= 0}
                onClick={runCase}
                type="button"
              >
                {running ? "Running…" : "Run Case"}
              </button>
            </div>
            {budgetTxHash ? (
              <a
                className="budget-link"
                href={`${ARC_CONFIG.explorer}/tx/${budgetTxHash}`}
                rel="noreferrer"
                target="_blank"
              >
                View funding transaction
              </a>
            ) : (
              <div className="budget-note">
                Fund a case budget first. The app will not simulate or fabricate payouts.
              </div>
            )}
          </section>

          {error ? <div className="error-banner">{error}</div> : null}

          <div className="dashboard-grid">
            <section className="panel result-panel">
              <div className="panel-title">
                Latest case report <span className="panel-badge">structured output</span>
              </div>
              {latestResult ? (
                <div className="result-grid">
                  <div>
                    <h3>Intake summary</h3>
                    <p>{latestResult.orchestrator.summary}</p>
                  </div>
                  <div>
                    <h3>Specialists consulted</h3>
                    <ul>
                      {latestResult.orchestrator.specialists.map((specialist) => (
                        <li key={specialist}>{specialist}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Risk flags</h3>
                    <ul>
                      {latestResult.verifier.riskFlags.map((riskFlag) => (
                        <li key={riskFlag}>{riskFlag}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Urgency</h3>
                    <p>{latestResult.verifier.urgency}</p>
                    <p className="result-disclaimer">
                      This is a workflow assistant, not medical advice or diagnosis.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  No case has been run yet. Fund a budget and execute a real workflow to
                  populate this report.
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-title">
                Arc transactions <span className="panel-badge">latest receipts</span>
              </div>
              {transactions.length ? (
                transactions.slice(0, 8).map((transaction) => (
                  <div className="tx-row" key={`${transaction.hash}-${transaction.to}`}>
                    <a
                      className="tx-hash"
                      href={transaction.explorerUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {transaction.hash}
                    </a>
                    <span className="tx-from-to">
                      {transaction.from} → {transaction.to}
                    </span>
                    <span className="tx-amt">{formatUsdc(transaction.amount)}</span>
                    <span className="tx-ok">{transaction.status}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  No transactions yet. Funding and agent payouts will appear here with real
                  Arc explorer links.
                </div>
              )}
            </section>
          </div>

          <section className="panel">
            <div className="panel-title">
              Settled cases <span className="panel-badge">real history</span>
            </div>
            {cases.length ? (
              cases.map((caseItem) => (
                <div className="case-row" key={caseItem.id}>
                  <span className="case-id">{caseItem.id}</span>
                  <div className="case-tags">
                    {caseItem.specialties.map((specialty) => (
                      <span
                        className={cn(
                          "tag",
                          specialty === "cardiology" && "tag-card",
                          specialty === "neurology" && "tag-neuro",
                          specialty === "respiratory" && "tag-resp",
                          specialty === "general" && "tag-gen",
                        )}
                        key={`${caseItem.id}-${specialty}`}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <span className="case-cost">{formatUsdc(caseItem.totalCost)}</span>
                  <span className="case-status">{caseItem.urgency}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                Settled cases will appear here after a funded workflow completes.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
