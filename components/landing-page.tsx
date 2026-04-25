"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@/components/connect-button";
import { ARC_CONFIG } from "@/lib/arc";

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="landing-page">
      <nav className="nav">
        <div className="logo">
          Care<span>Route</span>
        </div>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#tracks">Tracks</a>
          <a href="#settlement-loop">Settlement</a>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <Link className="btn-outline" href={ARC_CONFIG.explorer}>
            View Explorer
          </Link>
          <ConnectButton
            connectedLabel="launch"
            onConnected={() => router.push("/dashboard")}
          />
        </div>
      </nav>

      <section className="hero">
        <div className="badge">
          <div className="dot" />
          Built on Arc · Real specialist routing
        </div>
        <h1>
          Clinical intake,
          <br />
          <em>priced per step.</em>
        </h1>
        <p>
          CareRoute is a clinical workflow assistant where the user funds a small
          case budget in USDC, specialist agents spend from that budget only when
          they are needed, and every step settles on Arc Testnet.
        </p>
        <div className="hero-actions">
          <ConnectButton
            connectedLabel="launch"
            onConnected={() => router.push("/dashboard")}
          />
          <Link className="btn-outline" href={ARC_CONFIG.explorer}>
            View on Arc Explorer
          </Link>
        </div>
        <p className="hero-note" style={{ marginTop: "1rem" }}>
          ≤ $0.01 per action · user wallet funded · Arc Testnet
        </p>
      </section>

      <section className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">$0.020</div>
          <div className="stat-label">example case budget</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">$0.002</div>
          <div className="stat-label">per specialist review</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">&lt;1s</div>
          <div className="stat-label">Arc settlement finality</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">5</div>
          <div className="stat-label">agents in the loop</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">USDC</div>
          <div className="stat-label">user-funded and settled</div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="section-label">How it works</div>
        <div className="section-title">Five agents. One intake. Real budget control.</div>
        <div className="section-sub">
          A patient describes symptoms once. The orchestrator summarizes the intake,
          routes to specialist agents, and the verifier consolidates structured risk
          flags and urgency guidance.
        </div>
        <div className="flow-grid">
          <div className="flow-node">
            <div className="flow-icon">🧑</div>
            <div className="flow-name">Patient Input</div>
            <div className="flow-price">free</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node accent">
            <div className="flow-icon">🎛️</div>
            <div className="flow-name">Orchestrator</div>
            <div className="flow-price">$0.001</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">
            <div className="flow-icon">🫀</div>
            <div className="flow-name">Cardio Agent</div>
            <div className="flow-price">$0.002</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">
            <div className="flow-icon">🧠</div>
            <div className="flow-name">Neuro Agent</div>
            <div className="flow-price">$0.002</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node accent">
            <div className="flow-icon">✅</div>
            <div className="flow-name">Verifier</div>
            <div className="flow-price">$0.001</div>
          </div>
        </div>
        <div className="flow-summary">
          total typical case cost: <strong>$0.006-$0.008</strong> · user funds
          budget first · unused balance can be refunded
        </div>
      </section>

      <section className="proof-section">
        <div className="section-label">Margin proof</div>
        <div className="section-title">Why this belongs on Arc</div>
        <div className="section-sub">
          CareRoute only works because Arc keeps settlement economically viable for
          repeated sub-cent actions. The same workflow on a gas-heavy chain breaks
          the unit economics.
        </div>
        <div className="proof-grid">
          <div className="proof-card">
            <div className="proof-num green">$0.008</div>
            <div className="proof-label">Typical total case spend on Arc</div>
            <div className="proof-detail">
              User funds budget once
              <br />
              Orchestrator and specialists consume only what runs
              <br />
              Verifier closes the case
              <br />
              Remaining balance can be refunded
            </div>
          </div>
          <div className="proof-card">
            <div className="proof-num red">$18.40</div>
            <div className="proof-label">Illustrative 4-step flow on a gas-heavy L1</div>
            <div className="proof-detail">
              4 transactions × illustrative $4.60 gas
              <br />
              Revenue per case: sub-cent to low-cent range
              <br />
              Margin collapses before specialist work is paid
              <br />
              <br />
              Arc keeps per-action billing commercially viable.
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="tracks">
        <div className="section-label">Track alignment</div>
        <div className="section-title">Built for the Arc hackathon brief</div>
        <div className="tracks-grid">
          <div className="track-card">
            <div className="track-tag">Usage-Based Compute Billing</div>
            <div className="track-title">Per-agent, per-analysis billing</div>
            <div className="track-desc">
              Each specialist agent charges for its exact compute contribution.
              The case pays only for the steps that actually run.
            </div>
          </div>
          <div className="track-card">
            <div className="track-tag">Agent-to-Agent Payment Loop</div>
            <div className="track-title">User budget routed through agents</div>
            <div className="track-desc">
              The user funds the case budget once, and the orchestrator pays
              downstream agents autonomously from that budget.
            </div>
          </div>
          <div className="track-card">
            <div className="track-tag">Per-API Monetization Engine</div>
            <div className="track-title">Every case step is a paid endpoint</div>
            <div className="track-desc">
              Specialist services are metered paid calls, with Arc explorer receipts
              tied to each real workflow.
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="settlement-loop" style={{ paddingTop: 0 }}>
        <div className="section-label">Settlement loop</div>
        <div className="section-title">Money starts from the user wallet</div>
        <div className="tx-demo">
          <div className="tx-header">
            CONNECT WALLET → FUND CASE BUDGET → ORCHESTRATOR PAYS SPECIALISTS →
            REFUND REMAINING BALANCE
          </div>
          <div className="tx-row">
            <span className="tx-id">1</span>
            <span className="tx-agent">User funds a small case budget from their wallet</span>
            <span className="tx-amount">$0.020</span>
            <span className="tx-status">real</span>
          </div>
          <div className="tx-row">
            <span className="tx-id">2</span>
            <span className="tx-agent">The orchestrator spends only the steps required for the case</span>
            <span className="tx-amount">$0.001-$0.002</span>
            <span className="tx-status">real</span>
          </div>
          <div className="tx-row">
            <span className="tx-id">3</span>
            <span className="tx-agent">Unused balance can be returned to the same wallet</span>
            <span className="tx-amount">remaining</span>
            <span className="tx-status">real</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="section-label" style={{ marginBottom: "0.8rem" }}>
          Built for Agentic Economy on Arc
        </div>
        <h2>
          Real user-funded
          <br />
          clinical intake routing.
        </h2>
        <p>
          Connect a wallet, fund a case budget, and run a real Arc-settled workflow
          with specialist agents and structured risk flags.
        </p>
        <div className="cta-actions">
          <ConnectButton
            connectedLabel="launch"
            onConnected={() => router.push("/dashboard")}
          />
          <a className="btn-outline" href="https://docs.arc.network/build">
            Arc Docs
          </a>
        </div>
        <div className="tech-chips">
          <div className="chip">Arc L1</div>
          <div className="chip">USDC</div>
          <div className="chip">AI/ML API</div>
          <div className="chip">User-funded case budgets</div>
          <div className="chip">Specialist routing</div>
          <div className="chip">Refund remaining balance</div>
        </div>
      </section>
    </div>
  );
}
