// Builds the client proposal from the same shared data every module uses.
// The proposal page, "copy" and "export" all render from this one model.
import { calcQuote, diagnose, formatRate, formatYuan, groupEvidence, PRICE_PER_PAGE, PRICE_PER_WEEK } from "./geo-calc";
import {
  EVIDENCE_TYPE_META,
  PENDING_EVIDENCE,
  SUGGESTED_SCENES,
  UNVERIFIED,
  type Evidence,
  type PlatformRow,
  type QuoteConfig,
} from "./geo-data";

const uniq = (list: string[]) => [...new Set(list.map((s) => s.trim()).filter(Boolean))];

export function summarizeResearch(evidence: Evidence[]) {
  const g = groupEvidence(evidence);
  const proven = [...g.direct, ...g.indirect];
  let verdict: string;
  if (g.direct.length > 0) {
    verdict = `已有 ${g.direct.length} 条直接证据表明美国目标工业采购人群在寻找供应商或采购中使用 AI。`;
  } else if (g.indirect.length > 0) {
    verdict = `目前仅有 ${g.indirect.length} 条间接证据，只能说明一般 B2B 买家或美国企业使用 AI，尚不能直接证明 40–60 岁目标行业采购负责人会使用 AI 寻找供应商。`;
  } else {
    verdict = `暂无可用证据，${PENDING_EVIDENCE}。`;
  }
  if (g.gap.length > 0) verdict += `仍有 ${g.gap.length} 个证据缺口待补充。`;
  return {
    verdict,
    supports: uniq(proven.map((e) => e.supports)),
    limitations: uniq(proven.map((e) => e.limitation)),
    gaps: g.gap,
    items: proven,
  };
}

export function buildProposal(input: {
  project: string;
  monitoring: PlatformRow[];
  evidence: Evidence[];
  config: QuoteConfig;
}) {
  const diag = diagnose(input.monitoring);
  const research = summarizeResearch(input.evidence);
  const quote = calcQuote(input.config);
  const shownScenes = SUGGESTED_SCENES.slice(0, Math.min(quote.scenes, SUGGESTED_SCENES.length));
  return {
    project: input.project,
    diag,
    research,
    quote,
    config: input.config,
    scenes: {
      count: quote.scenes,
      shown: shownScenes,
      remaining: Math.max(0, quote.scenes - shownScenes.length),
    },
  };
}

export type Proposal = ReturnType<typeof buildProposal>;

const languagesText = (p: Proposal) => p.config.languages.join("、") || "未选择";

export function prLine(p: Proposal) {
  return p.config.pr === "不包含" ? "不包含" : `${p.config.pr}（金额待确认，不计入已确认小计）`;
}

export function proposalToText(p: Proposal): string {
  const L: string[] = [];
  const { diag, research, quote, config } = p;
  L.push(`${p.project} GEO 服务方案`, "工业设备 / 美国市场 / 集装箱篷房", "");
  L.push("一、客户现状（模拟 AI 搜索监测样本）");
  for (const r of [...diag.platforms, diag.overall]) {
    L.push(
      `- ${r.platform}：本品牌提及率 ${formatRate(r.brandRate)}（${r.brand}/${r.answers}），竞品 A 提及率 ${formatRate(r.competitorRate)}（${r.competitor}/${r.answers}）`,
    );
  }
  L.push("诊断：");
  diag.conclusions.forEach((c) => L.push(`- ${c}`));
  L.push("注：监测数据只反映当前样本中的品牌提及情况，不代表实际市场份额或采购意愿。", "");

  L.push("二、买家调研");
  L.push(`当前判断：${research.verdict}`);
  if (research.items.length === 0) L.push(`- ${PENDING_EVIDENCE}`);
  research.items.forEach((e, i) => {
    L.push(`${i + 1}. ${e.title}【${EVIDENCE_TYPE_META[e.type].label}】`);
    L.push(`   来源：${e.source || UNVERIFIED}${e.date ? `，${e.date}` : ""}`);
    if (e.url) L.push(`   链接：${e.url}`);
    L.push(`   调查对象：${e.audience || UNVERIFIED}`);
    L.push(`   结论：${e.conclusion}`);
    L.push(`   支持判断：${e.supports || UNVERIFIED}`);
    L.push(`   局限：${e.limitation || UNVERIFIED}`);
  });
  L.push("证据缺口（待补充证据）：");
  if (research.gaps.length === 0) L.push("- 暂无已登记的证据缺口");
  research.gaps.forEach((g) => L.push(`- ${g.title}：${g.conclusion}`));
  L.push("");

  L.push("三、采购场景建议");
  L.push(`计划覆盖 ${p.scenes.count} 个核心采购场景。以下为围绕美国集装箱篷房采购需求的建议方向示例，尚未经客户调研验证：`);
  p.scenes.shown.forEach((s) => L.push(`- ${s.en}（${s.zh}）：${s.note}`));
  if (p.scenes.remaining > 0) L.push(`- 其余 ${p.scenes.remaining} 个场景待与客户确认`);
  L.push("");

  L.push("四、交付范围");
  L.push(`- 核心采购场景：${quote.scenes} 个`);
  L.push(`- 语种：${languagesText(p)}（${quote.languageCount} 个）`);
  L.push(`- 内容页数：${quote.pages} 页`);
  L.push(`- 内容覆盖周期：${config.contentMonths} 个月`);
  L.push(`- 专项监测周期：${quote.weeks} 周 · ChatGPT / Google AI`);
  L.push(`- PR 服务：${config.pr}`, "");

  L.push("五、报价明细（人民币，不含税）");
  L.push(`- 内容建设：${quote.scenes} 个场景 × ${quote.languageCount} 个语种 = ${quote.pages} 页 × ${formatYuan(PRICE_PER_PAGE)}/页 = ${formatYuan(quote.contentFee)}`);
  L.push(`- 专项监测：${quote.weeks} 周 × ${formatYuan(PRICE_PER_WEEK)}/周 = ${formatYuan(quote.monitoringFee)}`);
  L.push(`- PR 服务：${prLine(p)}`);
  L.push(`- 已确认小计：${formatYuan(quote.subtotal)}`);
  L.push("", "本方案为售前演示草稿，费用及最终交付内容待双方确认。");
  return L.join("\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Standalone HTML document for export (opens in any browser or Word). */
export function proposalToHtml(p: Proposal): string {
  const { diag, research, quote, config } = p;
  const rows = [...diag.platforms, diag.overall]
    .map(
      (r) =>
        `<tr><td>${esc(r.platform)}</td><td>${r.answers}</td><td>${r.brand}</td><td><b>${formatRate(r.brandRate)}</b></td><td>${r.competitor}</td><td>${formatRate(r.competitorRate)}</td></tr>`,
    )
    .join("");
  const evidence = research.items.length
    ? research.items
        .map(
          (e) => `<div class="card"><p><b>${esc(e.title)}</b> <span class="tag">${EVIDENCE_TYPE_META[e.type].label}</span></p>
<p>来源：${esc(e.source || UNVERIFIED)}${e.date ? `，${esc(e.date)}` : ""}${e.url ? ` · <a href="${esc(e.url)}">${esc(e.url)}</a>` : ""}</p>
<p>调查对象：${esc(e.audience || UNVERIFIED)}</p><p>结论：${esc(e.conclusion)}</p>
<p>支持判断：${esc(e.supports || UNVERIFIED)}</p><p>局限：${esc(e.limitation || UNVERIFIED)}</p></div>`,
        )
        .join("")
    : `<p>${PENDING_EVIDENCE}</p>`;
  const gaps = research.gaps.length
    ? `<ul>${research.gaps.map((g) => `<li>${esc(g.title)}：${esc(g.conclusion)}</li>`).join("")}</ul>`
    : "<p>暂无已登记的证据缺口</p>";
  const scenes = `<ul>${p.scenes.shown.map((s) => `<li>${s.en}（${s.zh}）：${s.note}</li>`).join("")}${p.scenes.remaining > 0 ? `<li>其余 ${p.scenes.remaining} 个场景待与客户确认</li>` : ""}</ul>`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(p.project)} GEO 服务方案</title>
<style>body{font-family:"IBM Plex Sans","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;color:#2b2f36;max-width:860px;margin:40px auto;padding:0 24px;font-size:14px;line-height:1.8}
h1{font-size:24px;border-bottom:2px solid #2f6fe4;padding-bottom:16px}h2{font-size:17px;margin-top:32px;color:#2f6fe4}
table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #e2e5ea;padding:8px 12px;text-align:left}th{background:#f4f5f7;font-weight:500}
.card{border:1px solid #e2e5ea;border-radius:6px;padding:12px 16px;margin:10px 0}.card p{margin:2px 0}.tag{background:#eef3fd;color:#2f6fe4;border-radius:4px;padding:1px 6px;font-size:12px}.muted{color:#7a808a;font-size:12px}</style></head><body>
<h1>${esc(p.project)}<br>GEO 服务方案</h1><p class="muted">工业设备 / 美国市场 / 集装箱篷房 · 售前演示草稿</p>
<h2>01 客户现状</h2><table><tr><th>平台</th><th>有效回答</th><th>本品牌提及</th><th>本品牌提及率</th><th>竞品 A 提及</th><th>竞品 A 提及率</th></tr>${rows}</table>
<ul>${diag.conclusions.map((c) => `<li>${esc(c)}</li>`).join("")}</ul><p class="muted">监测数据只反映当前样本中的品牌提及情况，不代表实际市场份额或采购意愿。</p>
<h2>02 买家调研</h2><p><b>当前判断：</b>${esc(research.verdict)}</p>${evidence}<p><b>证据缺口（待补充证据）</b></p>${gaps}
<h2>03 采购场景建议</h2><p>计划覆盖 ${p.scenes.count} 个核心采购场景。以下为建议方向示例，尚未经客户调研验证：</p>${scenes}
<h2>04 交付范围</h2><table><tr><td>核心采购场景</td><td>${quote.scenes} 个</td></tr><tr><td>语种</td><td>${esc(languagesText(p))}（${quote.languageCount} 个）</td></tr><tr><td>内容页数</td><td>${quote.pages} 页</td></tr><tr><td>内容覆盖周期</td><td>${config.contentMonths} 个月</td></tr><tr><td>专项监测周期</td><td>${quote.weeks} 周 · ChatGPT / Google AI</td></tr><tr><td>PR 服务</td><td>${esc(config.pr)}</td></tr></table>
<h2>05 报价明细（人民币，不含税）</h2><table><tr><th>服务项目</th><th>配置 / 数量</th><th>单价</th><th>金额</th></tr>
<tr><td>内容建设</td><td>${quote.scenes} 个场景 × ${quote.languageCount} 个语种 = ${quote.pages} 页</td><td>${formatYuan(PRICE_PER_PAGE)} / 页</td><td>${formatYuan(quote.contentFee)}</td></tr>
<tr><td>专项监测</td><td>${quote.weeks} 周</td><td>${formatYuan(PRICE_PER_WEEK)} / 周</td><td>${formatYuan(quote.monitoringFee)}</td></tr>
<tr><td>PR 服务</td><td>${esc(config.pr)}</td><td>待确认</td><td>${config.pr === "不包含" ? "—" : "待确认"}</td></tr>
<tr><th colspan="3">已确认小计</th><th>${formatYuan(quote.subtotal)}</th></tr></table>
<p class="muted">内容覆盖周期：${config.contentMonths} 个月（不参与计费）。PR 金额待确认，不计入已确认小计。本方案为演示草稿，费用及最终交付内容待双方确认。</p>
</body></html>`;
}
