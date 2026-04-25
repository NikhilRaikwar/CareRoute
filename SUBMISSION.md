# CareRoute Submission Copy

## Submission Title

CareRoute

## Short Description

CareRoute is a wallet-funded clinical intake routing assistant where users fund a small USDC case budget and specialist AI agents consume it step by step, with every workflow payment settled on Arc Testnet.

## Long Description

CareRoute is a clinical workflow assistant built for the Agentic Economy on Arc. Instead of treating healthcare intake like a flat-fee SaaS workflow, CareRoute prices each reasoning step independently and settles those steps onchain in sub-cent USDC amounts. A user connects a wallet on Arc Testnet, funds a small case budget, and submits symptom intake. From there, an orchestrator agent summarizes the case and routes it to only the specialist agents that are actually needed. Cardiology, neurology, respiratory, and general review agents each produce structured findings, while a verifier agent aggregates the outputs into a single workflow-ready report with risk flags and urgency.

The product is intentionally framed as a clinical intake and routing assistant, not diagnosis software. That matters for both safety and product clarity. The demo shows how a real user-funded case budget can be consumed step by step by specialist agents, rather than forcing a subscription or flat platform fee for a short-lived workflow. This makes the economic model concrete: users pay only for the compute and specialist review actually used on a case.

CareRoute fits the hackathon especially well because the workflow is only viable when payments can happen at very small denominations and high frequency. A case may involve intake summarization, one or more specialist reviews, and a verifier pass, each priced below one cent. On traditional high-gas chains, paying dollars in gas to settle fractions of a cent makes the model irrational. Arc changes that equation by allowing fast, stablecoin-native settlement. In the live product, users can see the funding transaction, the downstream specialist settlement receipts, and the final structured output in one dashboard.

Technically, CareRoute uses a Next.js frontend, wallet connectivity via wagmi and RainbowKit, Arc Testnet settlement through viem, and AI/ML API for the agent reasoning layer. The dashboard is designed around a real workflow: connect wallet, fund case budget, submit symptoms, watch the specialist pipeline execute, and inspect the resulting Arc explorer links. That makes the demo easy to understand for judges and keeps the core proof tied directly to the hackathon theme: programmable value for agentic workflows, priced per action and settled in real time.

## Participation Mode

ONLINE

## Categories

- Healthcare
- AI Agents
- Payments
- Web3

## Event Tracks

- Usage-Based Compute Billing
- Agent-to-Agent Payment Loop
- Per-API Monetization Engine

## Technologies Used

- Arc Testnet
- USDC
- Next.js
- React
- wagmi
- RainbowKit
- viem
- AI/ML API
- TypeScript

## Did you use Circle products in your project?

Yes

## Circle Developer Console account email

Use the same email as your registered Circle Developer account.

## Circle Product Feedback

### Products Used

We used Arc Testnet as the settlement layer, USDC as the unit of value, and aligned the product architecture around Circle's Agentic Economy thesis: stablecoin-native, low-cost, high-frequency payments for agents and APIs. The frontend and demo flow are built to show repeated user-funded, per-step settlements that map directly to the intended Circle and Arc developer experience.

### Use Case

We chose these products because CareRoute is a usage-based clinical workflow assistant where each reasoning step has very low economic value on its own. That makes it a strong fit for Arc and Circle's programmable payment model. A user funds a small budget, specialist agents consume that budget only when needed, and the app can prove that clinical intake workflows can be priced per action rather than as subscriptions or flat software seats.

### Successes

What worked well was the clarity of the Arc-based economic model. It is easy to explain to judges and easy to demonstrate live: fund a wallet, execute a workflow, and show the resulting transactions on the Arc explorer. The stablecoin-native framing also made pricing and product messaging much clearer than a generic gas-token flow would have. From a product perspective, the Arc positioning around real-time, deterministic settlement maps very well to agent orchestration products.

### Challenges

The main challenge was stitching together the full developer experience across wallet UX, settlement, agent workflow logic, and repeatable demo execution. For hackathon builders, the biggest friction is usually not conceptual but operational: identifying the cleanest minimal path for repeated micropayment demos, handling env/config setup cleanly, and understanding the most submission-friendly way to show repeated proof of settlement. Another challenge is that builders often need clearer examples that combine user-funded flows with agent-to-agent payment loops in one reference architecture.

### Recommendations

The developer experience would improve with a single end-to-end starter focused on the hackathon pattern: user funds a budget, orchestrator routes work, specialist services are paid step by step, and explorer-visible receipts are rendered in a frontend dashboard. A reference app showing budget management, repeated transaction generation, and submission-ready metrics would save teams a lot of time. Better examples around wallet separation, backend-controlled agent execution, and how to present margin economics would also make the platform easier to adopt during short hackathons. Finally, tighter cross-linking between Arc docs, nanopayment concepts, and demo-ready starter repos would help builders move faster.

## Opt-in for Circle Developer communication

Yes

## Suggested X/Twitter Submission Post

```text
We built CareRoute for the Agentic Economy on Arc.

A wallet-funded clinical intake routing assistant where users fund a small USDC case budget and specialist AI agents consume it step by step on Arc Testnet.

Real user-funded workflow.
Real onchain settlement.
Real specialist routing.

Built with Arc + USDC + AI/ML API.

@buildoncircle @arc @lablabai
```
