import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NextStep, PageHeading, SectionHeading } from "@/components/workspace/headings";
import { QuoteDetails } from "@/components/workspace/QuoteDetails";
import { calcQuote, formatYuan, toCount } from "@/lib/geo-calc";
import { CONTENT_MONTH_OPTIONS, LANGUAGE_OPTIONS, PR_OPTIONS, type PrStatus } from "@/lib/geo-data";
import { cloneDefaultQuote, useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/quotation")({
  head: () => ({
    meta: [
      { title: "服务报价 · GEO 售前助手" },
      {
        name: "description",
        content: "配置采购场景、语种、内容覆盖周期与监测周期，自动计算 GEO 服务报价。",
      },
      { property: "og:title", content: "服务报价 · GEO 售前助手" },
      { property: "og:description", content: "按场景 × 语种自动计算内容页数、内容费用与监测费用。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotationPage,
});

function Stepper({
  id,
  value,
  label,
  onChange,
}: {
  id: string;
  value: number;
  label: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="number-field">
      <Button variant="outline" size="icon" aria-label={`减少${label}`} disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 1))}>
        <Minus />
      </Button>
      <Input id={id} type="number" min={0} step={1} value={value} onChange={(e) => onChange(toCount(Number(e.target.value)))} />
      <Button variant="outline" size="icon" aria-label={`增加${label}`} onClick={() => onChange(value + 1)}>
        <Plus />
      </Button>
    </div>
  );
}

function QuotationPage() {
  const { config, setConfig } = useWorkspace();
  const q = calcQuote(config);

  return (
    <>
      <PageHeading
        label="SERVICE QUOTATION"
        title="服务报价"
        description="明确客户的服务需求，为报价与交付范围建立统一口径。"
        action={
          <Button variant="outline" onClick={() => setConfig(cloneDefaultQuote())}>
            <RotateCcw /> 恢复默认
          </Button>
        }
      />
      <SectionHeading title="需求配置" extra={<span className="pending-tag">需求草稿</span>} />
      <div className="config-layout">
        <div className="config-form">
          <div>
            <label className="field-label" htmlFor="scenes">
              核心采购场景数量
            </label>
            <Stepper id="scenes" label="采购场景" value={config.scenes} onChange={(scenes) => setConfig({ ...config, scenes })} />
            <p className="field-description">覆盖目标客户的核心采购需求</p>
          </div>
          <div>
            <span className="field-label">语种</span>
            <div className="language-options">
              {LANGUAGE_OPTIONS.map((lang) => (
                <label key={lang}>
                  <input
                    type="checkbox"
                    checked={config.languages.includes(lang)}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        languages: e.target.checked
                          ? LANGUAGE_OPTIONS.filter((l) => l === lang || config.languages.includes(l))
                          : config.languages.filter((l) => l !== lang),
                      })
                    }
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="content-months">
              内容覆盖周期
            </label>
            <select
              id="content-months"
              value={config.contentMonths}
              onChange={(e) => setConfig({ ...config, contentMonths: Number(e.target.value) })}
            >
              {CONTENT_MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} 个月
                </option>
              ))}
            </select>
            <p className="field-description">完成全部核心采购场景及多语言内容建设所需时间，不参与费用计算</p>
          </div>
          <div>
            <label className="field-label" htmlFor="weeks">
              专项监测周期（周）
            </label>
            <Stepper id="weeks" label="监测周期" value={config.weeks} onChange={(weeks) => setConfig({ ...config, weeks })} />
          </div>
          <div>
            <label className="field-label" htmlFor="pr">
              PR 服务
            </label>
            <select id="pr" value={config.pr} onChange={(e) => setConfig({ ...config, pr: e.target.value as PrStatus })}>
              {PR_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
        <aside className="quote-summary">
          <h3>需求摘要</h3>
          <div className="summary-row">
            <span>核心采购场景</span>
            <strong>{q.scenes} 个</strong>
          </div>
          <div className="summary-row">
            <span>服务语种</span>
            <strong>{config.languages.join("、") || "未选择"}</strong>
          </div>
          <div className="summary-row">
            <span>专项监测周期</span>
            <strong>{q.weeks} 周</strong>
          </div>
          <div className="summary-row">
            <span>内容覆盖周期</span>
            <strong>{config.contentMonths} 个月</strong>
          </div>
          <div className="summary-row">
            <span>内容页数</span>
            <strong>{q.pages} 页</strong>
          </div>
          <div className="summary-row">
            <span>已确认小计</span>
            <strong className="text-primary">{formatYuan(q.subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>PR 服务</span>
            <strong>{config.pr}</strong>
          </div>
        </aside>
      </div>

      <section className="quotation-details">
        <SectionHeading title="报价明细" />
        <QuoteDetails config={config} />
      </section>

      <NextStep to="/proposal" title="下一步，查看客户方案" subtitle="将客户现状、调研证据和服务配置汇总为方案草稿。" />
    </>
  );
}
