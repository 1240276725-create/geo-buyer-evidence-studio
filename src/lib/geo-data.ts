// Shared data model + default demo data for the GEO presales workspace.

export type PlatformRow = {
  platform: string;
  queries: number;
  answers: number;
  brand: number;
  competitor: number;
};

export type EvidenceType = "direct" | "indirect" | "gap";

export type Evidence = {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  audience: string;
  conclusion: string;
  type: EvidenceType;
  supports: string;
  limitation: string;
};

export type PrStatus = "待确认" | "包含" | "不包含";

export type QuoteConfig = {
  scenes: number;
  languages: string[];
  contentMonths: number;
  weeks: number;
  pr: PrStatus;
};

export const LANGUAGE_OPTIONS = ["英语", "西班牙语", "法语", "德语"];
export const CONTENT_MONTH_OPTIONS = [1, 2, 3, 6];
export const PR_OPTIONS: PrStatus[] = ["待确认", "包含", "不包含"];

export const EVIDENCE_TYPE_META: Record<EvidenceType, { label: string; rule: string }> = {
  direct: {
    label: "直接证据",
    rule: "直接证明美国目标工业采购人群使用 AI 寻找供应商或辅助采购。",
  },
  indirect: {
    label: "间接证据",
    rule: "只能证明美国用户或企业、一般 B2B 买家使用 AI，不能直接证明目标行业采购行为。",
  },
  gap: {
    label: "证据缺口",
    rule: "缺少目标年龄（40–60 岁）、行业或实际采购行为的直接证据。",
  },
};

export const PENDING_EVIDENCE = "待补充证据";
export const UNVERIFIED = "待核实";

export const DEFAULT_MONITORING: PlatformRow[] = [
  { platform: "ChatGPT", queries: 310, answers: 300, brand: 36, competitor: 90 },
  { platform: "Google AI", queries: 320, answers: 300, brand: 54, competitor: 75 },
];

export const DEFAULT_QUOTE: QuoteConfig = {
  scenes: 60,
  languages: ["英语", "西班牙语", "法语"],
  contentMonths: 3,
  weeks: 2,
  pr: "待确认",
};

// Only verified public research. Sample size and the 60% finding were checked against
// the report text (methodology + footnote 1: "n=2063 B2B buyers and decision makers").
export const DEFAULT_EVIDENCE: Evidence[] = [
  {
    id: "nrg-2025",
    title:
      "Understanding the Empowered Buyer: A Playbook for Earning Trust in Today’s B2B Buyer Journey",
    source: "Google × National Research Group",
    url: "https://www.nrgmr.com/resources/Google%20B2B%20Buyer%20Journey_October_2025.pdf",
    date: "2025年10月",
    audience: "2063 名美国高级管理人员及 B2B 采购决策参与者",
    conclusion: "研究显示，60% 的受访 B2B 买家在购买商业产品或服务过程中使用 AI 工具。",
    type: "indirect",
    supports: "美国 B2B 采购过程中已经出现 AI 工具的使用行为。",
    limitation:
      "不能直接证明 40–60 岁集装箱篷房、仓库及设备租赁行业采购负责人使用 AI 寻找供应商。",
  },
  {
    id: "gap-age",
    title: "目标年龄人群（40–60 岁）的 AI 使用情况",
    source: "",
    url: "",
    date: "",
    audience: "40–60 岁美国工厂、仓库及设备租赁公司采购负责人",
    conclusion: PENDING_EVIDENCE,
    type: "gap",
    supports: "",
    limitation: "现有研究未按年龄拆分，无法判断目标年龄段的 AI 使用比例。",
  },
  {
    id: "gap-industry",
    title: "集装箱篷房、仓库及设备租赁行业采购人员的 AI 使用情况",
    source: "",
    url: "",
    date: "",
    audience: "集装箱篷房、仓库及设备租赁行业采购人员",
    conclusion: PENDING_EVIDENCE,
    type: "gap",
    supports: "",
    limitation: "现有研究覆盖企业服务、SaaS、零售等行业，未覆盖目标行业。",
  },
  {
    id: "gap-behavior",
    title: "目标人群是否实际使用 ChatGPT 或 Google AI 寻找供应商",
    source: "",
    url: "",
    date: "",
    audience: "美国工厂、仓库及设备租赁公司采购负责人",
    conclusion: PENDING_EVIDENCE,
    type: "gap",
    supports: "",
    limitation: "缺少目标人群实际使用 ChatGPT 或 Google AI 搜索、筛选供应商的行为数据。",
  },
];

export const SUGGESTED_SCENES = [
  { en: "Industrial Storage", zh: "工业仓储", note: "工厂原料、成品及设备的长期存放空间" },
  { en: "Temporary Warehouse", zh: "临时仓库", note: "旺季或项目期间的快速扩容仓储" },
  { en: "Construction Site Shelter", zh: "建筑工地临时篷房", note: "工地材料、机具防护与临时作业空间" },
  { en: "Equipment Rental", zh: "设备租赁", note: "租赁公司的户外设备存放与防护" },
  { en: "Agricultural Storage", zh: "农业仓储", note: "农机、饲料及农资的遮蔽存放" },
  { en: "Emergency Shelter", zh: "应急临时设施", note: "灾后或突发情况下的临时设施" },
];
