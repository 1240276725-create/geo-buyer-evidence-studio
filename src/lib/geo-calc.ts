// Pure calculation rules shared by every module. The proposal reads these same results.
import type { Evidence, PlatformRow, QuoteConfig } from "./geo-data";

export const PRICE_PER_PAGE = 180;
export const PRICE_PER_WEEK = 12000;
export const NO_DATA = "暂无有效数据";

const isCount = (n: number) => Number.isSafeInteger(n) && n >= 0;

/** Mention rate in percent, or null when it cannot be computed (no answers / invalid). */
export function mentionRate(mentions: number, answers: number): number | null {
  if (!isCount(mentions) || !isCount(answers) || answers === 0 || mentions > answers) return null;
  return (mentions / answers) * 100;
}

export function formatRate(rate: number | null): string {
  return rate === null ? NO_DATA : `${Number(rate.toFixed(1))}%`;
}

export function rowErrors(row: PlatformRow): string[] {
  const errors: string[] = [];
  if ([row.queries, row.answers, row.brand, row.competitor].some((n) => !isCount(n)))
    errors.push("监测数量必须为非负整数");
  if (row.answers > row.queries) errors.push("有效回答数不能大于发起查询数");
  if (row.brand > row.answers) errors.push("本品牌提及数不能大于有效回答数");
  if (row.competitor > row.answers) errors.push("竞品 A 提及数不能大于有效回答数");
  return errors;
}

export type RateResult = PlatformRow & {
  errors: string[];
  brandRate: number | null;
  competitorRate: number | null;
};

export function sumRows(rows: PlatformRow[]): PlatformRow {
  return rows.reduce(
    (acc, r) => ({
      platform: "整体监测样本",
      queries: acc.queries + r.queries,
      answers: acc.answers + r.answers,
      brand: acc.brand + r.brand,
      competitor: acc.competitor + r.competitor,
    }),
    { platform: "整体监测样本", queries: 0, answers: 0, brand: 0, competitor: 0 },
  );
}

export function diagnose(rows: PlatformRow[]) {
  const platforms: RateResult[] = rows.map((r) => {
    const errors = rowErrors(r);
    return {
      ...r,
      errors,
      brandRate: errors.length ? null : mentionRate(r.brand, r.answers),
      competitorRate: errors.length ? null : mentionRate(r.competitor, r.answers),
    };
  });
  const total = sumRows(rows);
  const errors = platforms.flatMap((p) => p.errors.map((e) => `${p.platform}：${e}`));
  // Overall = summed mentions / summed answers — never an average of platform percentages.
  const overall: RateResult = {
    ...total,
    errors,
    brandRate: errors.length ? null : mentionRate(total.brand, total.answers),
    competitorRate: errors.length ? null : mentionRate(total.competitor, total.answers),
  };
  return { platforms, overall, errors, conclusions: buildConclusions(platforms, overall) };
}

function buildConclusions(platforms: RateResult[], overall: RateResult): string[] {
  if (overall.brandRate === null || overall.competitorRate === null)
    return ["当前没有可用于提及率诊断的有效监测数据。"];
  const out: string[] = [];
  const mentioned = platforms.filter((p) => p.brand > 0).map((p) => p.platform);
  const presence =
    mentioned.length === platforms.length
      ? `本品牌在 ${platforms.map((p) => p.platform).join(" 和 ")} 上均有提及`
      : mentioned.length === 0
        ? "本品牌在各监测平台上均未被提及"
        : `本品牌仅在 ${mentioned.join("、")} 上有提及`;
  const b = overall.brandRate;
  const c = overall.competitorRate;
  const relation = b < c ? "低于" : b > c ? "高于" : "持平于";
  out.push(
    `${presence}，整体提及率为 ${formatRate(b)}，${relation}竞品 A 的 ${formatRate(c)}。`,
  );
  out.push(
    platforms
      .map(
        (p) =>
          `${p.platform} 平台本品牌提及率为 ${formatRate(p.brandRate)}，竞品 A 为 ${formatRate(p.competitorRate)}`,
      )
      .join("；") + "。",
  );
  if (b === 0) out.push("说明本品牌尚未在当前 AI 平台样本中获得曝光，需优先建立基础可见度。");
  else if (b < c) out.push("说明本品牌已经获得一定 AI 平台曝光，但与竞品相比仍有提升空间。");
  else out.push("说明本品牌在当前样本中的 AI 平台曝光不低于竞品 A，可继续巩固并扩大优势。");
  return out;
}

export type ValidationRule = {
  name: string;
  description: string;
  check: string;
  pass: boolean;
  issues: string[];
};

export function validationRules(rows: PlatformRow[]): ValidationRule[] {
  const t = sumRows(rows);
  const allInts = rows.every((r) =>
    [r.queries, r.answers, r.brand, r.competitor].every(isCount),
  );
  const intIssue = allInts ? [] : ["监测数量必须为非负整数"];
  const answerIssues = rows
    .filter((r) => r.answers > r.queries)
    .map((r) => `${r.platform} 有效回答数 ${r.answers} 大于发起查询数 ${r.queries}`);
  const mentionIssues = rows.flatMap((r) => [
    ...(r.brand > r.answers ? [`${r.platform} 本品牌提及数 ${r.brand} 大于有效回答数 ${r.answers}`] : []),
    ...(r.competitor > r.answers
      ? [`${r.platform} 竞品 A 提及数 ${r.competitor} 大于有效回答数 ${r.answers}`]
      : []),
  ]);
  const zero = rows.filter((r) => r.answers === 0);
  const anyAbnormal = answerIssues.length > 0 || mentionIssues.length > 0;
  const ob = anyAbnormal || !allInts ? null : mentionRate(t.brand, t.answers);
  const oc = anyAbnormal || !allInts ? null : mentionRate(t.competitor, t.answers);
  return [
    {
      name: "有效回答数 ≤ 发起查询数",
      description: "检查有效回答数量是否超过发起查询数量。",
      check: `本次检查：${rows.map((r) => `${r.platform} ${r.answers} ≤ ${r.queries}`).join("；")}。`,
      pass: allInts && answerIssues.length === 0,
      issues: allInts ? answerIssues : intIssue,
    },
    {
      name: "品牌提及数 ≤ 有效回答数",
      description: "检查本品牌和竞品提及数是否超过有效回答数量。",
      check: `本次检查：本品牌 ${t.brand} ≤ ${t.answers}；竞品 A ${t.competitor} ≤ ${t.answers}。`,
      pass: allInts && mentionIssues.length === 0,
      issues: allInts ? mentionIssues : intIssue,
    },
    {
      name: "有效回答数为 0 时不计算提及率",
      description: `当有效回答数为 0 时，显示「${NO_DATA}」，不得出现除以 0 的情况。`,
      check: zero.length
        ? `本次检查：${zero.map((r) => r.platform).join("、")} 有效回答数为 0，已跳过提及率计算。`
        : "本次检查：各平台有效回答数均大于 0，未出现除以 0 的情况。",
      pass: allInts,
      issues: intIssue,
    },
    {
      name: "失败记录不计入有效回答数",
      description:
        "查询失败、超时或回答为空的记录，仍计入发起查询数，但不计入有效回答数，也不纳入品牌提及率的分母。",
      check: `本次检查：共发起查询 ${t.queries} 次，其中 ${t.answers} 条有效回答进入提及率分母，${Math.max(0, t.queries - t.answers)} 条失败或空回答仅计入查询数。`,
      pass: allInts && t.answers <= t.queries,
      issues: allInts ? (t.answers > t.queries ? ["有效回答总数大于发起查询总数"] : []) : intIssue,
    },
    {
      name: "整体提及率按汇总分子和分母计算",
      description: "不允许直接对两个平台的提及率进行简单平均。",
      check: `本品牌：(${rows.map((r) => r.brand).join("+")})/(${rows.map((r) => r.answers).join("+")})=${formatRate(ob)}。竞品 A：(${rows.map((r) => r.competitor).join("+")})/(${rows.map((r) => r.answers).join("+")})=${formatRate(oc)}。`,
      pass: allInts && !anyAbnormal,
      issues: [...intIssue, ...(anyAbnormal ? ["存在数据异常，整体提及率已暂停计算"] : [])],
    },
  ];
}

/** Clamp any user input to a non-negative integer. */
export function toCount(n: number): number {
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function calcQuote(config: QuoteConfig) {
  const scenes = toCount(config.scenes);
  const weeks = toCount(config.weeks);
  const languageCount = new Set(config.languages).size;
  const pages = scenes * languageCount;
  const contentFee = pages * PRICE_PER_PAGE;
  const monitoringFee = weeks * PRICE_PER_WEEK;
  return {
    scenes,
    weeks,
    languageCount,
    pages,
    contentFee,
    monitoringFee,
    // PR has no confirmed price, so it never enters the confirmed subtotal.
    prAmount: null as number | null,
    subtotal: contentFee + monitoringFee,
  };
}

export function formatYuan(n: number): string {
  return `${n.toLocaleString("zh-CN")} 元`;
}

export function groupEvidence(evidence: Evidence[]) {
  return {
    direct: evidence.filter((e) => e.type === "direct"),
    indirect: evidence.filter((e) => e.type === "indirect"),
    gap: evidence.filter((e) => e.type === "gap"),
  };
}
