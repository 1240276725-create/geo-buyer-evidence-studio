import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  DEFAULT_EVIDENCE,
  DEFAULT_MONITORING,
  DEFAULT_QUOTE,
  type Evidence,
  type PlatformRow,
  type QuoteConfig,
} from "./geo-data";

type Workspace = {
  project: string;
  setProject: (v: string) => void;
  monitoring: PlatformRow[];
  setMonitoring: (v: PlatformRow[]) => void;
  evidence: Evidence[];
  setEvidence: (v: Evidence[]) => void;
  config: QuoteConfig;
  setConfig: (v: QuoteConfig) => void;
};

const WorkspaceContext = createContext<Workspace | null>(null);

export function cloneDefaultMonitoring() {
  return DEFAULT_MONITORING.map((r) => ({ ...r }));
}
export function cloneDefaultQuote(): QuoteConfig {
  return { ...DEFAULT_QUOTE, languages: [...DEFAULT_QUOTE.languages] };
}

/** Single shared source for all four modules; lives in the root layout. */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState("集装箱篷房 · 美国市场");
  const [monitoring, setMonitoring] = useState<PlatformRow[]>(cloneDefaultMonitoring);
  const [evidence, setEvidence] = useState<Evidence[]>(() => DEFAULT_EVIDENCE.map((e) => ({ ...e })));
  const [config, setConfig] = useState<QuoteConfig>(cloneDefaultQuote);
  const value = useMemo(
    () => ({ project, setProject, monitoring, setMonitoring, evidence, setEvidence, config, setConfig }),
    [project, monitoring, evidence, config],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("Workspace provider missing");
  return ctx;
}
