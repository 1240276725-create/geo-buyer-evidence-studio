import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Download, ExternalLink, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/workspace/headings";
import { QuoteDetails } from "@/components/workspace/QuoteDetails";
import { formatRate } from "@/lib/geo-calc";
import { EVIDENCE_TYPE_META, PENDING_EVIDENCE, UNVERIFIED } from "@/lib/geo-data";
import { buildProposal, proposalToHtml, proposalToText } from "@/lib/proposal";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/proposal")({
  head: () => ({
    meta: [
      { title: "客户方案 · GEO 售前助手" },
      {
        name: "description",
        content: "汇总数据诊断、买家调研与服务报价，生成可复制、可导出的一页式 GEO 客户方案。",
      },
      { property: "og:title", content: "客户方案 · GEO 售前助手" },
      { property: "og:description", content: "一页式 GEO 客户方案，数据与诊断、调研、报价模块实时同步。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProposalPage,
});

const SECTIONS = ["客户现状", "买家调研", "采购场景建议", "交付范围", "报价明细"];

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

function ProposalPage() {
  const ws = useWorkspace();
  const p = buildProposal(ws);
  const { diag, research, quote, config } = p;

  const onCopy = async () => {
    await copyText(proposalToText(p));
    toast.success("完整方案已复制");
  };
  const onExport = () => {
    const url = URL.createObjectURL(new Blob([proposalToHtml(p)], { type: "text/html;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.project}-GEO服务方案.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("方案已导出");
  };

  return (
    <>
      <PageHeading
        label="CLIENT PROPOSAL"
        title="客户方案"
        description="自动汇总数据诊断、买家调研和服务报价，形成一页式客户方案。"
        action={
          <div className="page-actions">
            <Button variant="outline" onClick={onCopy}>
              <Copy /> 复制方案
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> 打印 / 存为 PDF
            </Button>
            <Button onClick={onExport}>
              <Download /> 导出方案
            </Button>
          </div>
        }
      />
      <div className="proposal-layout">
        <nav className="proposal-nav" aria-label="方案目录">
          {SECTIONS.map((s, i) => (
            <a key={s} href={`#section-${i}`}>
              {String(i + 1).padStart(2, "0")}　{s}
            </a>
          ))}
        </nav>
        <article className="proposal-paper" id="proposal-paper">
          <header className="proposal-cover">
            <span className="pending-tag">客户方案 · 草稿</span>
            <h2>
              {p.project}
              <br />
              GEO 服务方案
            </h2>
            <p>工业设备 / 美国市场 / 集装箱篷房</p>
          </header>

          <section className="proposal-section" id="section-0">
            <h3>
              <span>01</span>客户现状
            </h3>
            <p>
              面向美国市场的工厂、仓库及设备租赁公司采购负责人，提供集装箱篷房相关产品与解决方案。以下数据读取自数据诊断模块（模拟 AI 搜索监测样本）。
            </p>
            <div className="proposal-stat-row">
              {[...diag.platforms, diag.overall].map((r) => (
                <div key={r.platform} data-testid={`rate-${r.platform}`}>
                  <strong>{formatRate(r.brandRate)}</strong>
                  <span>
                    {r.platform} · 本品牌（{r.brand}/{r.answers}）
                  </span>
                  <span className="block">
                    竞品 A {formatRate(r.competitorRate)}（{r.competitor}/{r.answers}）
                  </span>
                </div>
              ))}
            </div>
            <p className="proposal-subhead">当前品牌表现诊断</p>
            <ul>
              {diag.conclusions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="proposal-note">监测数据只反映当前样本中的品牌提及情况，不代表实际市场份额或采购意愿。</p>
          </section>

          <section className="proposal-section" id="section-1">
            <h3>
              <span>02</span>买家调研
            </h3>
            <p>
              <strong className="text-foreground">当前判断：</strong>
              {research.verdict}
            </p>
            {research.items.length === 0 ? (
              <p className="pending-evidence">{PENDING_EVIDENCE}</p>
            ) : (
              research.items.map((e) => (
                <div className="proposal-evidence" key={e.id}>
                  <div className="proposal-evidence-head">
                    <p>{e.title}</p>
                    <span className={`evidence-type ${e.type}`}>{EVIDENCE_TYPE_META[e.type].label}</span>
                  </div>
                  <dl className="proposal-kv">
                    <dt>来源</dt>
                    <dd>
                      {e.source || UNVERIFIED}
                      {e.date && ` · ${e.date}`}
                    </dd>
                    <dt>调查对象</dt>
                    <dd>{e.audience || UNVERIFIED}</dd>
                    <dt>结论</dt>
                    <dd>{e.conclusion}</dd>
                    <dt>支持判断</dt>
                    <dd>{e.supports || UNVERIFIED}</dd>
                    <dt>局限</dt>
                    <dd>{e.limitation || UNVERIFIED}</dd>
                  </dl>
                  {e.url && (
                    <a className="source-link" href={e.url} target="_blank" rel="noopener noreferrer">
                      查看来源 <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))
            )}
            <p className="proposal-subhead">目标人群证据缺口（待补充证据）</p>
            {research.gaps.length === 0 ? (
              <p>暂无已登记的证据缺口</p>
            ) : (
              <ul>
                {research.gaps.map((g) => (
                  <li key={g.id}>
                    {g.title}：<span className="pending-evidence">{g.conclusion}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="proposal-section" id="section-2">
            <h3>
              <span>03</span>采购场景建议
            </h3>
            {p.scenes.count === 0 ? (
              <p>
                尚未配置采购场景，请在<Link to="/quotation" className="text-primary">服务报价</Link>中设置。
              </p>
            ) : (
              <>
                <p>
                  计划覆盖 {p.scenes.count} 个核心采购场景。以下为围绕美国集装箱篷房采购需求的建议方向示例，尚未经客户调研验证，具体场景清单待确认。
                </p>
                <div className="scene-grid">
                  {p.scenes.shown.map((s) => (
                    <div className="scene-item" key={s.en}>
                      <strong>
                        {s.en}（{s.zh}）
                      </strong>
                      <span>{s.note}</span>
                    </div>
                  ))}
                </div>
                {p.scenes.remaining > 0 && <p className="proposal-note">其余 {p.scenes.remaining} 个场景待与客户确认。</p>}
              </>
            )}
          </section>

          <section className="proposal-section" id="section-3">
            <h3>
              <span>04</span>交付范围
            </h3>
            <div className="summary-row">
              <span>核心采购场景</span>
              <strong>{quote.scenes} 个</strong>
            </div>
            <div className="summary-row">
              <span>语种</span>
              <strong>
                {config.languages.join("、") || "未选择"}（{quote.languageCount} 个）
              </strong>
            </div>
            <div className="summary-row">
              <span>内容页数</span>
              <strong>{quote.pages} 页</strong>
            </div>
            <div className="summary-row">
              <span>内容覆盖周期</span>
              <strong>{config.contentMonths} 个月</strong>
            </div>
            <div className="summary-row">
              <span>专项监测周期</span>
              <strong>{quote.weeks} 周 · ChatGPT / Google AI</strong>
            </div>
            <div className="summary-row">
              <span>PR 服务</span>
              <strong>{config.pr}</strong>
            </div>
          </section>

          <section className="proposal-section" id="section-4">
            <h3>
              <span>05</span>报价明细
            </h3>
            <QuoteDetails config={config} />
            <p className="mt-4">费用及最终交付内容待双方确认。本方案为演示草稿。</p>
          </section>
        </article>
      </div>
    </>
  );
}
