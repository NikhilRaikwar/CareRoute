import { generateStructuredJson } from "@/lib/aiml";
import { payAgent } from "@/lib/transactions";
import type {
  AgentDecision,
  CaseRunResult,
  CaseSummary,
  OrchestratorResult,
  SpecialistName,
  VerifierResult,
} from "@/lib/types";

const specialistPrices: Record<SpecialistName | "verifier" | "orchestrator", number> = {
  orchestrator: 0.001,
  cardiology: 0.002,
  neurology: 0.002,
  respiratory: 0.002,
  general: 0.002,
  verifier: 0.001,
};

export const DEMO_CASES = [
  "54-year-old with chest pain, shortness of breath, and dizziness for two days.",
  "31-year-old with pounding headache, blurred vision, and tingling in left arm.",
  "67-year-old with cough, fever, wheezing, and worsening fatigue.",
  "24-year-old with fever, sore throat, body aches, and chest tightness.",
  "48-year-old with palpitations, mild chest pressure, and anxiety overnight.",
  "39-year-old with severe migraine symptoms and brief speech difficulty.",
  "72-year-old with productive cough, low oxygen reading, and weakness.",
  "28-year-old with dizziness, nausea, and intermittent numbness in fingers.",
  "52-year-old with exertional chest discomfort and shortness of breath.",
  "44-year-old with sinus congestion, cough, and chest burning.",
  "61-year-old with chest pressure after climbing stairs and left jaw pain.",
  "22-year-old with fainting episode after flu-like symptoms.",
  "58-year-old with shortness of breath, wheezing, and chest tightness.",
  "47-year-old with neck stiffness, headache, and light sensitivity.",
  "36-year-old with fatigue, dizziness, and rapid heartbeat.",
  "64-year-old with confusion, balance issues, and slurred speech.",
  "41-year-old with persistent cough and shallow breathing.",
  "33-year-old with chest fluttering and lightheadedness after exercise.",
  "56-year-old with numbness, facial droop concerns, and headache.",
  "29-year-old with mild fever, body aches, and chest congestion.",
];

function heuristicOrchestrator(symptoms: string): OrchestratorResult {
  const normalized = symptoms.toLowerCase();
  const specialists: SpecialistName[] = [];

  if (/(chest|heart|palpit|arm pain|jaw pain|pressure)/.test(normalized)) {
    specialists.push("cardiology");
  }
  if (/(headache|dizz|numb|speech|migraine|vision|confusion|tingling)/.test(normalized)) {
    specialists.push("neurology");
  }
  if (/(cough|breath|wheez|oxygen|lung|congestion)/.test(normalized)) {
    specialists.push("respiratory");
  }
  if (specialists.length === 0) {
    specialists.push("general");
  }

  return {
    summary:
      "Patient intake captured and routed into a structured triage workflow.",
    symptomCluster: specialists.join(", "),
    specialists: Array.from(new Set(specialists)).slice(0, 3),
  };
}

function heuristicDecision(specialty: SpecialistName, symptoms: string): AgentDecision {
  const base: Record<SpecialistName, AgentDecision> = {
    cardiology: {
      specialty,
      summary:
        "Cardiology review found cardiovascular-pattern symptoms that should be escalated if they intensify or persist.",
      findings: [
        "Chest or circulation-linked symptoms present.",
        "Recommend correlation with exertion, duration, and radiating pain.",
      ],
      riskFlags: ["Cardiac symptom cluster detected"],
      urgency: "urgent care",
    },
    neurology: {
      specialty,
      summary:
        "Neurology review found symptoms worth clinician follow-up if focal deficits, confusion, or worsening headache continue.",
      findings: [
        "Neurologic symptom cluster present.",
        "Monitor for weakness, speech changes, or worsening severity.",
      ],
      riskFlags: ["Neurologic symptom cluster detected"],
      urgency: "schedule clinician",
    },
    respiratory: {
      specialty,
      summary:
        "Respiratory review found airway or breathing-related symptoms that may require urgent evaluation if oxygenation worsens.",
      findings: [
        "Respiratory symptom cluster present.",
        "Track shortness of breath, wheeze, fever, and cough progression.",
      ],
      riskFlags: ["Respiratory symptom cluster detected"],
      urgency: "schedule clinician",
    },
    general: {
      specialty,
      summary:
        "General review found a broad symptom picture without a single dominant specialty lane.",
      findings: [
        "Use general triage follow-up.",
        "Escalate if symptoms intensify or new red flags appear.",
      ],
      riskFlags: ["General symptom review"],
      urgency: "self-monitor",
    },
  };

  if (/slurred speech|facial droop|fainting|left arm/.test(symptoms.toLowerCase())) {
    base.neurology.urgency = "emergency attention";
    base.neurology.riskFlags = ["Possible acute neurologic red flag"];
  }
  if (/shortness of breath|radiating/.test(symptoms.toLowerCase())) {
    base.cardiology.urgency = "emergency attention";
    base.cardiology.riskFlags = ["Possible cardiac red flag"];
  }

  return base[specialty];
}

function heuristicVerifier(decisions: AgentDecision[]): VerifierResult {
  const urgencyOrder = [
    "self-monitor",
    "schedule clinician",
    "urgent care",
    "emergency attention",
  ] as const;

  const urgency = decisions.reduce<VerifierResult["urgency"]>((current, next) => {
    return urgencyOrder.indexOf(next.urgency) > urgencyOrder.indexOf(current)
      ? next.urgency
      : current;
  }, "self-monitor");

  return {
    agreementSummary:
      "Verifier consolidated specialist outputs into a single risk-oriented case summary.",
    riskFlags: Array.from(new Set(decisions.flatMap((decision) => decision.riskFlags))),
    urgency,
    nextStep:
      urgency === "emergency attention"
        ? "Escalate for immediate medical assessment."
        : urgency === "urgent care"
          ? "Recommend prompt clinician evaluation."
          : urgency === "schedule clinician"
            ? "Recommend scheduling clinician follow-up."
            : "Continue self-monitoring and escalate if symptoms worsen.",
  };
}

async function orchestrate(symptoms: string): Promise<OrchestratorResult> {
  const fallback = heuristicOrchestrator(symptoms);
  return generateStructuredJson<OrchestratorResult>({
    system:
      "You are the CareRoute orchestrator. Convert symptom intake into a structured clinical workflow assistant routing plan. Never diagnose. Never prescribe. Focus on symptom classification and specialist routing. Fields: summary, symptomCluster, specialists.",
    prompt: `Symptoms: ${symptoms}\nReturn a JSON object with keys summary, symptomCluster, specialists where specialists is an array of cardiology|neurology|respiratory|general.`,
    fallback,
  });
}

async function evaluateSpecialist(
  specialty: SpecialistName,
  symptoms: string,
): Promise<AgentDecision> {
  const fallback = heuristicDecision(specialty, symptoms);
  return generateStructuredJson<AgentDecision>({
    system: `You are the ${specialty} specialist agent for CareRoute. You provide structured workflow support, not diagnosis or treatment. Return fields specialty, summary, findings, riskFlags, urgency.`,
    prompt: `Symptoms: ${symptoms}\nReturn JSON only.`,
    fallback,
  });
}

async function verifyCase(decisions: AgentDecision[]): Promise<VerifierResult> {
  const fallback = heuristicVerifier(decisions);
  return generateStructuredJson<VerifierResult>({
    system:
      "You are the verifier agent for CareRoute. Compare specialist opinions, produce structured risk flags and urgency. Never diagnose. Return fields agreementSummary, riskFlags, urgency, nextStep.",
    prompt: `Specialist outputs:\n${JSON.stringify(decisions, null, 2)}`,
    fallback,
  });
}

let caseCounter = 248;

export async function runCareRouteCase({
  symptoms,
  budgetTxHash,
}: {
  symptoms: string;
  walletAddress?: string;
  budgetTxHash?: string;
}): Promise<CaseRunResult> {
  const orchestrator = await orchestrate(symptoms);

  const orchestratorTx = await payAgent({
    to: "verifier",
    amount: specialistPrices.orchestrator,
  });

  const specialistResults: AgentDecision[] = [];
  const transactionRecords = [orchestratorTx];

  for (const specialist of orchestrator.specialists) {
    const decision = await evaluateSpecialist(specialist, symptoms);
    specialistResults.push(decision);
    transactionRecords.push(
      await payAgent({
        to: specialist,
        amount: specialistPrices[specialist],
      }),
    );
  }

  const verifier = await verifyCase(specialistResults);
  transactionRecords.push(
    await payAgent({
      to: "verifier",
      amount: specialistPrices.verifier,
    }),
  );

  const totalCost = transactionRecords.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  const summary: CaseSummary = {
    id: `CASE-${caseCounter++}`,
    specialties: orchestrator.specialists,
    totalCost,
    urgency: verifier.urgency,
    status: "complete",
  };

  return {
    summary,
    orchestrator,
    specialists: specialistResults,
    verifier,
    transactions: transactionRecords,
    totalCost,
  };
}
