export type SpecialistName =
  | "cardiology"
  | "neurology"
  | "respiratory"
  | "general";

export type AgentDecision = {
  specialty: SpecialistName;
  summary: string;
  findings: string[];
  riskFlags: string[];
  urgency: "self-monitor" | "schedule clinician" | "urgent care" | "emergency attention";
};

export type OrchestratorResult = {
  summary: string;
  symptomCluster: string;
  specialists: SpecialistName[];
};

export type VerifierResult = {
  agreementSummary: string;
  riskFlags: string[];
  urgency: "self-monitor" | "schedule clinician" | "urgent care" | "emergency attention";
  nextStep: string;
};

export type TransactionRecord = {
  hash: string;
  from: string;
  to: string;
  amount: number;
  status: "confirmed" | "mocked";
  explorerUrl: string;
};

export type CaseSummary = {
  id: string;
  specialties: SpecialistName[];
  totalCost: number;
  urgency: VerifierResult["urgency"];
  status: "complete";
};

export type CaseRunResult = {
  summary: CaseSummary;
  orchestrator: OrchestratorResult;
  specialists: AgentDecision[];
  verifier: VerifierResult;
  transactions: TransactionRecord[];
  totalCost: number;
};
